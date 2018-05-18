import _ from 'lodash'
import session from 'express-session'
import redisUrl from 'redis-url'
import connectRedis from 'connect-redis'
import sessionStore from 'sessionstore'
import config from '../config'

const NO_SESSION_ROUTES = ['/ping']
let sessionMiddleware = null
let redisStore = null
export const prefix = `${process.env.NODE_ENV}-${config.name}-session:`

const sessionsDBUrl = process.env.SESSIONS_DATABASE_URL
if (!sessionsDBUrl) console.log('Warning: Missing process.env.SESSIONS_DATABASE_URL')

const sessionOptions = {
  saveUninitialized: true,
  resave: true,
  secret: config.sessionSecret,
  cookie: {
    maxAge: config.sessionAge,
    // domain: config.hostname,
  },
}

if (sessionsDBUrl && sessionsDBUrl.match(/^redis/)) {
  const RedisStore = connectRedis(session)
  const sessionUrlParts = redisUrl.parse(sessionsDBUrl)
  const redisOptions = {
    prefix,
    pass: sessionUrlParts.password,
    host: sessionUrlParts.hostname,
    port: +sessionUrlParts.port || 6379,
    db: sessionUrlParts.pathname ? +sessionUrlParts.pathname.split('/')[1] : 1,
    ttl: config.sessionAge/1000,
    logErrors: true,
  }
  redisStore = new RedisStore(redisOptions)
  console.log(`Using redis sessions: ${redisOptions.host}:${redisOptions.port}/${redisOptions.db}`)
  sessionMiddleware = session(_.extend(sessionOptions, {store: redisStore}))
}
else {
  if (sessionsDBUrl && !sessionsDBUrl.match(/^memory/)) console.log(`Unknown session db protocol: ${sessionsDBUrl}`)
  console.log(`Using memory sessions`)

  sessionStore.createSessionStore()
  sessionMiddleware = session(_.extend(sessionOptions, {store: sessionStore.createSessionStore()}))
}

export default (req, res, next) => {
  if (!sessionMiddleware || _.includes(NO_SESSION_ROUTES, req.url)) return next()
  if (req.query.$auth_secret) return next()
  sessionMiddleware(req, res, next)
}

export {redisStore}

