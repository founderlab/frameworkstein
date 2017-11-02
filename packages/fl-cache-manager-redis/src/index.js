import _ from 'lodash'
import RedisPool from 'sol-redis-pool'
import {EventEmitter} from 'events'
import redisUrl from 'redis-url'

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
    const redisOptions = this.getFromUrl(options) || options || {}
    const poolSettings = redisOptions

    redisOptions.host = redisOptions.host || '127.0.0.1'
    redisOptions.port = redisOptions.port || 6379
    this.pool = new RedisPool(redisOptions, poolSettings)

    this.pool.on('error', err => {
      this.events.emit('redisError', err)
    })

    this._ttl = redisOptions.ttl
    this.db = redisOptions.db
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

  /**
   * Extracts options from an args.url
   * @param {Object} args
   * @param {String} args.url a string in format of redis://[:password@]host[:port][/db-number][?option=value]
   * @returns {Object} the input object args if it is falsy, does not contain url or url is not string, otherwise a new object with own properties of args
   * but with host, port, db, ttl and auth_pass properties overridden by those provided in args.url.
   */
  getFromUrl(args) {
    if (!args || typeof args.url !== 'string') {
      return args
    }

    try {
      const options = redisUrl.parse(args.url)
      const newArgs = _.cloneDeep(args)
      newArgs.host = options.hostname
      newArgs.port = parseInt(options.port, 10)
      newArgs.db = parseInt(options.database, 10)
      newArgs.auth_pass = options.password
      newArgs.password = options.password
      if (options.query && options.query.ttl) {
        newArgs.ttl = parseInt(options.query.ttl, 10)
      }
      return newArgs

    }
    catch (e) {
      //url is unparsable so returning original
      return args
    }

  }

  /**
   * Helper to connect to a connection pool
   * @private
   * @param {Function} callback - A callback that returns
   */
  connect = callback => {
    this.pool.acquire((err, conn) => {
      if (err) {
        this.pool.release(conn)
        return callback(err)
      }

      if (this.db || this.db === 0) {
        conn.select(this.db)
      }

      callback(null, conn)
    })
  }

  parse = (values, key) => {
    if (_.isNull(values) || (values === 'null')) return null
    if (_.isDate(values)) return values
    if (_.isArray(values)) return _.map(values, this.parse)
    if (_.isObject(values)) {
      const result = {}
      _.forEach(values, (value, key) => {
        result[key] = this.parse(value, key)
      })
      return result
    }
    else if (_.isString(values)) {
      try {
        // Date
        if ((values.length >= 20) && values[values.length-1] === 'Z') {
          const date = new Date(values)
          const isValidDate = date.getTime() !== 0 && !!date.getTime()
          if (isValidDate) return date
        }
        // Stringified JSON
        let parsedValues = JSON.parse(values)
        if (this.stringifyKey && this.stringifyKey(key) && _.isNumber(parsedValues)) {
          return parsedValues.toString()
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
   * Helper to handle callback and release the connection
   * @private
   * @param {Object} conn - The Redis connection
   * @param {Function} [callback] - A callback that returns a potential error and the result
   * @param {Object} [opts] - The options (optional)
   */
  handleResponse = (conn, _options, _callback) => {
    const {callback, options} = typeof _options === 'function' ? {callback: _options, options: {}} : {callback: _callback, options: _options || {}}
    return (err, _result) => {
      this.pool.release(conn)
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

    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }

      // If we can get a hash from this key that's where we'll store the value
      // We need to manually set the expiry in this case, as there's no hsetex operation in redis
      if (this.hashFromKey) {
        const hash = this.hashFromKey(key)
        if (hash) {
          return conn.hget(hash, key, this.handleResponse(conn, {hash, key, hashParse: true}, callback))
        }
      }

      conn.get(key, this.handleResponse(conn, {parse: true}, callback))
    })
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
    const {callback, options} = typeof _options === 'function' ? {callback: _options, options: {}} : {callback: _callback, options: _options || {}}

    if (!this.isCacheableValue(value)) {
      return callback(new Error('value cannot be ' + value))
    }

    const ttl = (options.ttl || options.ttl === 0) ? options.ttl : this._ttl

    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }

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
          return conn.hset(hash, key, JSON.stringify(valueContainer), this.handleResponse(conn, callback))
        }
      }

      const val = JSON.stringify(value) || '"undefined"'
      if (ttl) {
        conn.setex(key, ttl, val, this.handleResponse(conn, callback))
      }
      else {
        conn.set(key, val, this.handleResponse(conn, callback))
      }
    })
  }

  /**
   * Delete value of a given key
   * @method del
   * @param {String} key - The cache key
   * @param {Object} [options] - The options (optional)
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  del = (key, _options, _callback) => {
    const {callback, options} = typeof _options === 'function' ? {callback: _options, options: {}} : {callback: _callback, options: _options || {}}

    if (this.hashFromKey && !options.skipHashFromKey) {
      const hash = this.hashFromKey(key)
      if (hash) {
        return this.hdel(hash, key, options, callback)
      }
    }

    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      conn.del(key, this.handleResponse(conn, callback))
    })
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

    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      conn.hdel(hash, key, this.handleResponse(conn, callback))
    })
  }

  /**
   * Delete all the keys of the currently selected DB
   * @method reset
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  reset = callback => {
    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      conn.flushdb(this.handleResponse(conn, callback))
    })
  }

  /**
   * Delete all the keys in the given hash
   * This is just sugar around del(hash=key, callback)
   * @method hreset
   * @param {Function} [callback] - A callback that returns a potential error, otherwise null
   */
  hreset = (hash, callback) => this.del(hash, {skipHashFromKey: true}, callback)

  /**
   * Returns the remaining time to live of a key that has a timeout.
   * @method ttl
   * @param {String} key - The cache key
   * @param {Function} callback - A callback that returns a potential error and the response
   */
  ttl = (key, callback) => {
    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      conn.ttl(key, this.handleResponse(conn, callback))
    })
  }

  /**
   * Returns all keys matching pattern.
   * @method keys
   * @param {String} pattern - The pattern used to match keys
   * @param {Function} callback - A callback that returns a potential error and the response
   */
  keys = (_pattern, _callback) => {
    const {callback, pattern} = typeof _pattern === 'function' ? {callback: _pattern, pattern: '*'} : {callback: _callback, pattern: _pattern}

    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      conn.keys(pattern, this.handleResponse(conn, callback))
    })
  }

  /**
   * Returns the underlying redis client connection
   * @method getClient
   * @param {Function} callback - A callback that returns a potential error and an object containing the Redis client and a done method
   */
  getClient = callback => {
    this.connect((err, conn) => {
      if (err) {
        return callback && callback(err)
      }
      callback(null, {
        client: conn,
        done: done => {
          const options = Array.prototype.slice.call(arguments, 1)
          this.pool.release(conn)

          if (done && typeof done === 'function') {
            done.apply(null, options)
          }
        },
      })
    })
  }

}

module.exports = {
  create: options => new RedisStore(options),
}
