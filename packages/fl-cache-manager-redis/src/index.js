import _ from 'lodash'
import { EventEmitter } from 'events'
import redis from 'redis'


function createRedisClient(redisOptions) {
  const redisClient = redis.createClient(redisOptions)
  redisClient.on('error', err => this.events.emit('redisError', err))

  return redisClient
}

/**
 * The cache manager Redis Store module
 * @module redisStore
 * @param {Object} [options] - The store configuration (optional)
 * @param {String} options.host - The Redis server host
 * @param {Number} options.port - The Redis server port
 * @param {Number} options.db - The Redis server db
 * @param {Function} options.hashFromKey - If present, hashes will be generated from keys and values will be stored in the corresponding hash
 * @param {Function} options.isCacheableValue - to override built-in isCacheableValue (optional)
 */
class RedisStore {
  constructor(options) {
    this.name = 'redis'
    this.events = new EventEmitter()
    this.client = createRedisClient(options.redis)

    this._ttl = options.ttl
    this.db = options.db
    this.hashFromKey = options.hashFromKey
    this.stringifyKey = options.stringifyKey

    /**
     * Specify which values should and should not be cached.
     * If the returns true, it will be stored in cache.
     * By default, it caches everything except undefined values.
     * Can be overriden via standard node-cache-manager options.
     * @method isCacheableValue
     * @param {String} value - The value to check
     * @return {Boolean} - Returns true if the value is cacheable, otherwise false.
     */
    this.isCacheableValue = options.isCacheableValue || (value => value !== undefined && value !== null)
  }

  parse = (values, key) => {
    if (_.isNull(values) || (values === 'null')) return null
    if (_.isDate(values)) return values
    if (_.isArray(values)) return _.map(values, this.parse)
    if (_.isObject(values)) {
      const result = {}
      for (const key of Object.getOwnPropertyNames(values)) {
        result[key] = this.parse(values[key], key)
      }
      return result
    }
    else if (_.isString(values)) {
      try {
        // Date
        if ((values.length >= 20) && values[values.length - 1] === 'Z') {
          const date = new Date(values)
          const isValidDate = date.getTime() !== 0 && !!date.getTime()
          if (isValidDate) return date
        }
        // Stringified JSON
        const parsedValues = JSON.parse(values)

        // If the parse result is a number values is a number or a string containing a number, either way just return it
        if (_.isNumber(parsedValues)) {
          if (this.stringifyKey && this.stringifyKey(key)) {
            return parsedValues.toString()
          }
          return values
        }

        return this.parse(parsedValues, key)
      }
      catch (err) {
        return values
      }
    }
    return values
  }

  /**
   * Helper to handle callback
   * @private
   * @param {Function} [callback] - A callback that returns a potential error and the result
   * @param {Object} [opts] - The options (optional)
   */
  handleResponse = (_options, _callback) => {
    const { callback, options } = typeof _options === 'function' ? { callback: _options, options: {} } : { callback: _callback, options: _options || {} }
    return (err, _result) => {
      if (err) return callback(err)
      let result = _result

      if (options.parse) {
        try {
          result = this.parse(result)
        }
        catch (e) {
          return callback(e)
        }
      }
      else if (options.hashParse) {
        try {
          const resultContainer = this.parse(result)
          if (!resultContainer) return callback(null, resultContainer)
          result = resultContainer.value
          if (resultContainer._redis_set_at) {
            const now = new Date()
            const then = resultContainer._redis_set_at
            const expired = now.getTime() - then.getTime() > resultContainer.ttl
            if (expired) {
              return this.hdel(options.hash, options.key, err => callback && callback(err))
            }
          }
        }
        catch (e) {
          return callback && callback(e)
        }
      }

      callback && callback(null, result)
    }
  }

  /**
   * Get a value for a given key.
   * @method get
   * @param {String} key - The cache key
   * @param {Object} [options] - The options (optional)
   * @param {Function} callback - A callback that returns a potential error and the response
   */
  get = (key, options, _callback) => {
    const callback = typeof options === 'function' ? options : _callback

    // If we can get a hash from this key that's where we'll store the value
    // We need to manually set the expiry in this case, as there's no hsetex operation in redis
    if (this.hashFromKey) {
      const hash = this.hashFromKey(key)
      if (hash) {
        return this.client.hget(hash, key, this.handleResponse({ hash, key, hashParse: true }, callback))
      }
    }

    this.client.get(key, this.handleResponse({ parse: true }, callback))
  }

  /**
   * Set a value for a given key.
   * @method set
   * @param {String} key - The cache key
   * @param {String} value - The value to set
   * @param {Object} [options] - The options (optional)
   * @param {Object} options.ttl - The ttl value
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  set = (key, value, _options, _callback) => {
    const { callback, options } = typeof _options === 'function' ? { callback: _options, options: {} } : { callback: _callback, options: _options || {} }

    if (!this.isCacheableValue(value)) {
      return callback(new Error('value cannot be ' + value))
    }

    const ttl = (options.ttl || options.ttl === 0) ? options.ttl : this._ttl

    // If we can get a hash from this key that's where we'll store the value
    // We need to manually set the expiry in this case, as there's no hsetex operation in redis
    if (this.hashFromKey) {
      const hash = this.hashFromKey(key)
      if (hash) {
        const valueContainer = {
          ttl,
          value,
          _redis_set_at: new Date().toISOString(),
        }
        return this.client.hset(hash, key, JSON.stringify(valueContainer), this.handleResponse(callback))
      }
    }

    const val = JSON.stringify(value) || '"undefined"'
    if (ttl) {
      this.client.setex(key, ttl, val, this.handleResponse(callback))
    }
    else {
      this.client.set(key, val, this.handleResponse(callback))
    }
  }

  /**
   * Delete value of a given key
   * @method del
   * @param {String} key - The cache key
   * @param {Object} [options] - The options (optional)
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  del = (key, _options, _callback) => {
    const { callback, options } = typeof _options === 'function' ? { callback: _options, options: {} } : { callback: _callback, options: _options || {} }

    if (this.hashFromKey && !options.skipHashFromKey) {
      const hash = this.hashFromKey(key)
      if (hash) {
        return this.hdel(hash, key, options, callback)
      }
    }

    this.client.del(key, this.handleResponse(callback))
  }

  /**
   * Delete value of a given key in a given hash
   * @method hdel
   * @param {String} hash - The hash key
   * @param {String} key - The cache key
   * @param {Object} [options] - The options (optional)
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  hdel = (hash, key, options, _callback) => {
    const callback = typeof options === 'function' ? options : _callback

    this.client.hdel(hash, key, this.handleResponse(callback))
  }

  /**
   * Delete all the keys of the currently selected DB
   * @method reset
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  reset = callback => {
    this.client.flushdb(this.handleResponse(callback))
  }

  /**
   * Delete all the keys in the given hash
   * This is just sugar around del(hash=key, callback)
   * @method hreset
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  hreset = (hash, callback) => this.del(hash, { skipHashFromKey: true }, callback)

  /**
   * Returns the remaining time to live of a key that has a timeout.
   * @method ttl
   * @param {String} key - The cache key
   * @param {Function} callback - A callback that returns a potential error and the response
   */
  ttl = (key, callback) => {
    this.client.ttl(key, this.handleResponse(callback))
  }

  /**
   * Returns all keys matching pattern.
   * @method keys
   * @param {String} pattern - The pattern used to match keys
   * @param {Function} callback - A callback that returns a potential error and the response
   */
  keys = (_pattern, _callback) => {
    const { callback, pattern } = typeof _pattern === 'function' ? { callback: _pattern, pattern: '*' } : { callback: _callback, pattern: _pattern }

    this.client.keys(pattern, this.handleResponse(callback))
  }

}

module.exports = {
  create: options => new RedisStore(options),
}
