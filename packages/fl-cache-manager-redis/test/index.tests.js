const config = require('./config.json')
const redisStore = require('../src')
const sinon = require('sinon')
const assert = require('assert')

let redisCache
let customRedisCache

before(() => {
  redisCache = require('cache-manager').caching({
    store: redisStore,
    url: process.env.REDIS_URL,
    ttl: config.redis.ttl,
  })

  customRedisCache = require('cache-manager').caching({
    store: redisStore,
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    ttl: config.redis.ttl,
    isCacheableValue: val => {
      // allow undefined
      if (val === undefined) return true
      // disallow FooBarString
      else if (val === 'FooBarString') return false
      return redisCache.store.isCacheableValue(val)
    },
  })
})

describe('initialization', () => {

  it('should create a store with password instead of auth_pass (auth_pass is deprecated for redis > 2.5)', done => {
    const redisPwdCache = require('cache-manager').caching({
      store: redisStore,
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.auth_pass,
      db: config.redis.db,
      ttl: config.redis.ttl,
    })

    assert.equal(redisPwdCache.store.pool._redis_options.password, config.redis.auth_pass)
    redisPwdCache.set('pwdfoo', 'pwdbar', err => {
      assert.equal(err, null)
      redisCache.del('pwdfoo', errDel => {
        assert.equal(errDel, null)
        done()
      })
    })
  })

})

describe('set', () => {
  it('should store a value without ttl', done => {
    redisCache.set('foo', 'bar', err => {
      assert.equal(err, null)
      done()
    })
  })

  it('should store a value with a specific ttl', done => {
    redisCache.set('foo', 'bar', config.redis.ttl, err => {
      assert.equal(err, null)
      done()
    })
  })

  it('should store a value with a infinite ttl', done => {
    redisCache.set('foo', 'bar', {ttl: 0}, err => {
      assert.equal(err, null)
      redisCache.ttl('foo', (err, ttl) => {
        assert.equal(err, null)
        assert.equal(ttl, -1)
        done()
      })
    })
  })

  it('should store a null value without error', done => {
    redisCache.set('foo2', null, err => {
      try {
        assert.equal(err, null)
        redisCache.get('foo2', (err, value) => {
          assert.equal(err, null)
          assert.equal(value, null)
          done()
        })
      }
      catch (e) {
        done(e)
      }
    })
  })

  it('should store a value without callback', done => {
    redisCache.set('foo', 'baz')
    redisCache.get('foo', (err, value) => {
      assert.equal(err, null)
      assert.equal(value, 'baz')
      done()
    })
  })

  it('should not store an invalid value', done => {
    redisCache.set('foo1', undefined, err => {
      try {
        assert.notEqual(err, null)
        assert.equal(err.message, 'value cannot be undefined')
        done()
      }
      catch (e) {
        done(e)
      }
    })
  })

  it('should store an undefined value if permitted by isCacheableValue', done => {
    assert(customRedisCache.store.isCacheableValue(undefined), true)
    customRedisCache.set('foo3', undefined, err => {
      try {
        assert.equal(err, null)
        customRedisCache.get('foo3', (err, data) => {
          try {
            assert.equal(err, null)
            // redis stored undefined as 'undefined'
            assert.equal(data, 'undefined')
            done()
          }
          catch (e) {
            done(e)
          }
        })
      }
      catch (e) {
        done(e)
      }
    })
  })

  it('should not store a value disallowed by isCacheableValue', done => {
    assert.strictEqual(customRedisCache.store.isCacheableValue('FooBarString'), false)
    customRedisCache.set('foobar', 'FooBarString', err => {
      try {
        assert.notEqual(err, null)
        assert.equal(err.message, 'value cannot be FooBarString')
        done()
      }
      catch (e) {
        done(e)
      }
    })
  })

})

describe('get', () => {
  it('should retrieve a value for a given key', done => {
    const value = 'bar'
    redisCache.set('foo', value, () => {
      redisCache.get('foo', (err, result) => {
        assert.equal(err, null)
        assert.equal(result, value)
        done()
      })
    })
  })

  it('should retrieve a value for a given key if options provided', done => {
    const value = 'bar'
    redisCache.set('foo', value, () => {
      redisCache.get('foo', {}, (err, result) => {
        assert.equal(err, null)
        assert.equal(result, value)
        done()
      })
    })
  })

  it('should return null when the key is invalid', done => {
    redisCache.get('invalidKey', (err, result) => {
      assert.equal(err, null)
      assert.equal(result, null)
      done()
    })
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.get('foo', err => {
      pool.acquire.restore()
      pool.release.restore()
      assert.notEqual(err, null)
      done()
    })
  })
})

describe('del', () => {
  it('should delete a value for a given key', done => {
    redisCache.set('foo', 'bar', () => {
      redisCache.del('foo', err => {
        assert.equal(err, null)
        done()
      })
    })
  })

  it('should delete a value for a given key without callback', done => {
    redisCache.set('foo', 'bar', () => {
      redisCache.del('foo')
      done()
    })
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.set('foo', 'bar', () => {
      redisCache.del('foo', err => {
        pool.acquire.restore()
        pool.release.restore()
        assert.notEqual(err, null)
        done()
      })
    })
  })
})

describe('reset', () => {
  it('should flush underlying db', done => {
    redisCache.reset(err => {
      assert.equal(err, null)
      done()
    })
  })

  it('should flush underlying db without callback', done => {
    redisCache.reset()
    done()
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.reset(err => {
      pool.acquire.restore()
      pool.release.restore()
      assert.notEqual(err, null)
      done()
    })
  })
})

describe('ttl', () => {
  it('should retrieve ttl for a given key', done => {
    redisCache.set('foo', 'bar', () => {
      redisCache.ttl('foo', (err, ttl) => {
        assert.equal(err, null)
        assert.equal(ttl, config.redis.ttl)
        done()
      })
    })
  })

  it('should retrieve ttl for an invalid key', done => {
    redisCache.ttl('invalidKey', (err, ttl) => {
      assert.equal(err, null)
      assert.notEqual(ttl, null)
      done()
    })
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.set('foo', 'bar', () => {
      redisCache.ttl('foo', err => {
        pool.acquire.restore()
        pool.release.restore()
        assert.notEqual(err, null)
        done()
      })
    })
  })
})

describe('keys', () => {
  it('should return an array of keys for the given pattern', done => {
    redisCache.set('foo', 'bar', () => {
      redisCache.keys('f*', (err, arrayOfKeys) => {
        assert.equal(err, null)
        assert.notEqual(arrayOfKeys, null)
        assert.notEqual(arrayOfKeys.indexOf('foo'), -1)
        done()
      })
    })
  })

  it('should return an array of keys without pattern', done => {
    redisCache.set('foo', 'bar', () => {
      redisCache.keys((err, arrayOfKeys) => {
        assert.equal(err, null)
        assert.notEqual(arrayOfKeys, null)
        assert.notEqual(arrayOfKeys.indexOf('foo'), -1)
        done()
      })
    })
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.set('foo', 'bar', () => {
      redisCache.keys('f*', err => {
        pool.acquire.restore()
        pool.release.restore()
        assert.notEqual(err, null)
        done()
      })
    })
  })
})

describe('isCacheableValue', () => {
  it('should return true when the value is not undefined', done => {
    assert.equal(redisCache.store.isCacheableValue(0), true)
    assert.equal(redisCache.store.isCacheableValue(100), true)
    assert.equal(redisCache.store.isCacheableValue(''), true)
    assert.equal(redisCache.store.isCacheableValue('test'), true)
    assert.equal(redisCache.store.isCacheableValue(null), true)
    done()
  })

  it('should return false when the value is undefined', done => {
    assert.equal(redisCache.store.isCacheableValue(undefined), false)
    done()
  })
})

describe('getClient', () => {
  it('should return redis client', done => {
    redisCache.store.getClient((err, redis) => {
      assert.equal(err, null)
      assert.notEqual(redis, null)
      assert.notEqual(redis.client, null)
      redis.done(done)
    })
  })

  it('should handle no done callback without an error', done => {
    redisCache.store.getClient((err, redis) => {
      assert.equal(err, null)
      assert.notEqual(redis, null)
      assert.notEqual(redis.client, null)
      redis.done()
      done()
    })
  })

  it('should return an error if there is an error acquiring a connection', done => {
    const pool = redisCache.store.pool
    sinon.stub(pool, 'acquire').yieldsAsync('Something unexpected')
    sinon.stub(pool, 'release')
    redisCache.store.getClient(err => {
      pool.acquire.restore()
      pool.release.restore()
      assert.notEqual(err, null)
      done()
    })
  })
})

describe('redisErrorEvent', () => {
  it('should return an error when the redis server is unavailable', done => {
    redisCache.store.events.on('redisError', err => {
      assert.notEqual(err, null)
      done()
    })
    redisCache.store.pool.emit('error', 'Something unexpected')
  })
})

describe('uses url to override redis options', () => {
  let redisCacheByUrl

  before(() => {
    redisCacheByUrl = require('cache-manager').caching({
      store: redisStore,
      // redis://[:password@]host[:port][/db-number][?option=value]
      url: 'redis://:' + config.redis.auth_pass +'@' + config.redis.host + ':' + config.redis.port + '/' + config.redis.db +'?ttl=' + config.redis.ttl,
      // some fakes to see that url overrides them
      host: 'test-host',
      port: -78,
      db: -7,
      auth_pass: 'test_pass',
      password: 'test_pass',
      ttl: -6,
    })
  })

  it('should ignore other options if set in url', () => {
    assert.equal(redisCacheByUrl.store.pool._redis_options.host, config.redis.host)
    assert.equal(redisCacheByUrl.store.pool._redis_options.port, config.redis.port)
    assert.equal(redisCacheByUrl.store.pool._redis_default_db, config.redis.db)
    assert.equal(redisCacheByUrl.store.pool._redis_options.auth_pass, config.redis.auth_pass)
    assert.equal(redisCacheByUrl.store.pool._redis_options.password, config.redis.auth_pass)
  })

  it('should get and set values without error', done => {
    const key = 'byUrlKey'
    const value = 'test'
    redisCacheByUrl.set(key, value, err => {
      assert.equal(err, null)
      redisCacheByUrl.get(key, (err, val) => {
        assert.equal(err, null)
        assert.equal(val, value)
        done()
      })
    })
  })
})

describe('overridable isCacheableValue function', () => {
  let redisCache2

  before(() => {
    redisCache2 = require('cache-manager').caching({
      store: redisStore,
      isCacheableValue: () => {return 'I was overridden'},
    })
  })

  it('should return its return value instead of the built-in function', done => {
    assert.equal(redisCache2.store.isCacheableValue(0), 'I was overridden')
    done()
  })
})

describe('defaults', () => {
  let redisCache2

  before(() => {
    redisCache2 = require('cache-manager').caching({
      store: redisStore,
    })
  })

  it('should default the host to `127.0.0.1`', () => {
    assert.equal(redisCache2.store.pool._redis_options.host, '127.0.0.1')
  })

  it('should default the port to 6379', () => {
    assert.equal(redisCache2.store.pool._redis_options.port, 6379)
  })
})


describe('puts values in hashes when hashFromKey is provided', () => {
  let hashyRedisCache

  before(() => {
    hashyRedisCache = require('cache-manager').caching({
      store: redisStore,
      url: process.env.REDIS_URL,
      ttl: config.redis.ttl,
      hashFromKey: key => key.split('|')[0],
    })
  })

  it('should get and set values without error', done => {
    const key = 'hashkeyprefix|realkey'
    const value = 'test_1'

    hashyRedisCache.set(key, value, err => {
      assert.equal(err, null)

      hashyRedisCache.get(key, (err, val) => {
        assert.equal(err, null)
        assert.equal(val, value)
        done()
      })
    })
  })

  it('should not return a key that has timed out', done => {
    const key = 'hashkeyprefix|newkey'
    const value = 'test_2'

    hashyRedisCache.set(key, value, {ttl: 1}, err => {
      assert.equal(err, null)

      setTimeout(() => {
        hashyRedisCache.get(key, (err, val) => {
          assert.equal(err, null)
          assert.ok(!val)
          done()
        })
      }, 10)
    })
  })

  it('should clear a hash key with hdel', done => {
    const key = 'hashkeyprefix|hdel'
    const value = 'test'

    hashyRedisCache.set(key, value, err => {
      assert.equal(err, null)

      hashyRedisCache.store.hdel('hashkeyprefix', key, err => {
        assert.equal(err, null)

        hashyRedisCache.get(key, (err, val) => {
          assert.equal(err, null)
          assert.ok(!val)
          done()
        })
      })
    })
  })

  it('should clear a whole hash with hreset', done => {
    const key = 'hashkeyprefix|hreset'
    const value = 'test'

    hashyRedisCache.set(key, value, err => {
      assert.equal(err, null)

      hashyRedisCache.store.hreset('hashkeyprefix', err => {
        assert.equal(err, null)

        hashyRedisCache.get(key, (err, val) => {
          assert.equal(err, null)
          assert.ok(!val)
          done()
        })
      })
    })
  })

})
