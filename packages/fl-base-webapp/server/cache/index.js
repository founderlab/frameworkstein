import _ from 'lodash' // eslint-disable-line
import cacheManager from 'cache-manager'
import redisStore from 'fl-cache-manager-redis'


const cacheUrl = process.env.SESSIONS_DATABASE_URL
let ttlMs = +process.env.CACHE_MS
if (!ttlMs) ttlMs = process.env.NODE_ENV === 'development' ? 0 * 1000 : 5 * 60 * 1000 // 5 minutes in production

const options = {
  store: 'memory',
  ttl: ttlMs,
}

if (cacheUrl && cacheUrl.match(/^redis/)) {
  options.store = redisStore
  options.url = cacheUrl
  options.ttl = ttlMs
  options.hashFromKey = key => key && key.split('|')[0]
  options.stringifyKey = key => key && (key === 'id' || key.endsWith('_id'))
}

export default cacheManager.caching(options)
