import _ from 'lodash'
import cache from './index'


const cacheOptions = {ttl: 60 * 60 * 1000} // 1 hour
const idKey = id => `rl_user|${id}`
const verbose = false

export function wrapById(id, getUser, callback) {
  const key = idKey(id)
  return cache.wrap(key, getUser, cacheOptions, callback)
}

export function clearById(id, callback=(e => e)) {
  cache.del(idKey(id), err => {
    verbose && console.log('cleared', id, err, idKey(id))
    callback(err)
  })
}
