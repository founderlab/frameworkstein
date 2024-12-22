const config = require('./config.json')
const redisStore = require('../src')
const sinon = require('sinon')
const assert = require('assert')

let redisCache
let customRedisCache

const defaultOptions = {
  store: redisStore,
  redis: { url: process.env.REDIS_URL },
  ttl: config.redis.ttl,
}

before(() => {
  redisCache = require('cache-manager').caching({
    ...defaultOptions,
  })

  customRedisCache = require('cache-manager').caching({
    ...defaultOptions,
    isCacheableValue: val => {
      // allow undefined
      if (val === undefined) return true
      // disallow FooBarString
      else if (val === 'FooBarString') return false
      return redisCache.store.isCacheableValue(val)
    },
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

  // it('should store a null value without error', done => {
  //   redisCache.set('foo2', null, err => {
  //     try {
  //       assert.equal(err, null)
  //       redisCache.get('foo2', (err, value) => {
  //         assert.equal(err, null)
  //         assert.equal(value, null)
  //         done()
  //       })
  //     }
  //     catch (e) {
  //       done(e)
  //     }
  //   })
  // })

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

})

describe('isCacheableValue', () => {
  it('should return true when the value is not undefined', done => {
    assert.equal(redisCache.store.isCacheableValue(0), true)
    assert.equal(redisCache.store.isCacheableValue(100), true)
    assert.equal(redisCache.store.isCacheableValue(''), true)
    assert.equal(redisCache.store.isCacheableValue('test'), true)
    // assert.equal(redisCache.store.isCacheableValue(null), true)
    done()
  })

  it('should return false when the value is undefined', done => {
    assert.equal(redisCache.store.isCacheableValue(undefined), false)
    done()
  })
})

describe('redisErrorEvent', () => {
  it('should return an error when the redis server is unavailable', done => {
    redisCache.store.events.on('redisError', err => {
      assert.notEqual(err, null)
      done()
    })
    redisCache.store.events.emit('redisError', 'Something unexpected')
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


describe('puts values in hashes when hashFromKey is provided', () => {
  let hashyRedisCache

  before(() => {
    hashyRedisCache = require('cache-manager').caching({
      ...defaultOptions,
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

  it('returns keys with values older than given date', done => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // set 2 keys, wait 200ms then set the third
    hashyRedisCache.set('hashkeyprefix|key1', { key: 1 }, async err => {
      assert.equal(err, null)

      await sleep(50)

      hashyRedisCache.set('hashkeyprefix|key2', { key: 2 }, async err => {
        assert.equal(err, null)

        const beforeDate = new Date()
        await sleep(200)

        hashyRedisCache.set('hashkeyprefix|key3', { key: 3 }, err => {
          assert.equal(err, null)

          hashyRedisCache.store.hscanBefore('hashkeyprefix', beforeDate, (err, oldKeys) => {
            assert.equal(err, null)

            assert.strictEqual(oldKeys.length, 2)
            assert(oldKeys.includes('hashkeyprefix|key1'))
            assert(oldKeys.includes('hashkeyprefix|key2'))
            assert(!oldKeys.includes('hashkeyprefix|key3'))
            done()
          })
        })
      })
    })
  })

  it('deletes keys with values older than given date', done => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // set 2 keys, wait 200ms then set the third
    hashyRedisCache.set('hashkeyprefix|key1', { key: 1 }, async err => {
      assert.equal(err, null)

      await sleep(50)

      hashyRedisCache.set('hashkeyprefix|key2', { key: 2 }, async err => {
        assert.equal(err, null)

        const beforeDate = new Date()
        await sleep(200)

        hashyRedisCache.set('hashkeyprefix|key3', { key: 3 }, err => {
          assert.equal(err, null)

          hashyRedisCache.store.hdelBefore('hashkeyprefix', beforeDate, (err) => {
            assert.equal(err, null)

            hashyRedisCache.store.hscanBefore('hashkeyprefix', new Date(), (err, keys) => {
              assert.equal(err, null)

              assert.strictEqual(keys.length, 1)
              assert(keys.includes('hashkeyprefix|key3'))
              done()
            })
          })
        })
      })
    })
  })
})
