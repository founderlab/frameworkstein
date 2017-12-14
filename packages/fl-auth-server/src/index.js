import _ from 'lodash'
import configureStrategies from './configure/strategies'
import configureRoutes from './configure/routes'
import configureMiddleware from './configure/middleware'
import configureSerializing from './configure/serialize'
import sessionOrToken from './middleware/sessionOrToken'
import createAuthMiddleware from './middleware/authorised'
import createInternalMiddleware from './middleware/internal'
import AccessToken from './models/AccessToken'
import RefreshToken from './models/RefreshToken'
import {createToken, findOrCreateAccessToken} from './lib'

const beforeRedirect = (req, res, next) => {
  req.session.returnTo = req.query.returnTo || req.headers.referer || '/'
  req.session.save(err => {
    if (err) console.log('[fl-auth] beforeRedirect: Error saving session', err)
    next()
  })
}

const defaults = {
  middleware: {
    initialize: true,
    session: true,
  },
  paths: {
    login: '/login',
    logout: '/logout',
    loginStatus: '/login-status',
    register: '/register',
    resetRequest: '/reset-request',
    reset: '/reset',
    confirm: '/confirm-email',
    success: '/',
  },
  serializing: {

  },
  login: {
    userQuery: email => ({email}),
    isValidUsername: email => email && _.isString(email) && email.match(/.+@.+/),
    usernameField: 'email',
    passwordField: 'password',
    badRequestMessage: 'Missing credentials',
    resetTokenExpiresMs: 1000 * 60 * 60 * 24 * 7, // 7 days
    extraRegisterParams: [],
  },
  sendConfirmationEmail: (user, callback) => {
    console.log('[fl-auth] sendConfirmationEmail not configured. No email confirmation email will be sent. Token:', user.get('email'), user.get('emailConfirmationToken'))
    callback()
  },
  sendResetEmail: (user, callback) => {
    console.log('[fl-auth] sendResetEmail not configured. No password reset email will be sent. Reset token:', user.get('email'), user.get('resetToken'))
    callback()
  },
}

const oAuthDefaults = {
  facebook: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/facebook',
      callback: '/auth/facebook/callback',
      mobile: '/auth/facebook/mobile',
      success: '/',
      failure: '/',
    },
    scope: ['email'],
    profileFields: [
      'id',
      'displayName',
      'email',
      'cover',
      'name',
      'age_range',
      'link',
      'locale',
      'picture',
      'timezone',
      'updated_time',
      'verified',
    ],
    onLogin: (user, profile, isNew, callback) => callback(),
    beforeRedirect,
  },
  linkedIn: {
    url: process.env.URL,
    paths: {
      redirect: '/auth/linkedin',
      callback: '/auth/linkedin/callback',
      success: '/',
      failure: '/',
    },
    scope: ['r_emailaddress', 'r_basicprofile'],
    profileFields: ['first-name', 'last-name', 'email-address', 'formatted-name', 'location', 'industry', 'summary', 'specialties', 'positions', 'picture-url', 'public-profile-url'],
    onLogin: (user, profile, isNew, callback) => callback(),
    beforeRedirect,
  },
}


export default function configure(_options={}) {
  const options = _.merge(defaults, _options)
  if (!options.app) throw new Error('[fl-auth] init: Missing app from options')
  if (!options.User) options.User = require('./models/user')

  if (!options.serializing.serializeUser) {
    options.serializing.serializeUser = (user, callback) => {
      if (!user) return callback(new Error('[fl-auth] User missing'))
      callback(null, user.id)
    }
  }
  if (!options.serializing.deserializeUser) {
    options.serializing.deserializeUser = (id, callback) => options.User.cursor({id, $one: true}).toJSON(callback)
  }

  if (options.facebook) options.facebook = _.merge(oAuthDefaults.facebook, options.facebook)
  if (options.linkedIn) options.linkedIn = _.merge(oAuthDefaults.linkedIn, options.linkedIn)

  configureMiddleware(options)
  configureSerializing(options)
  configureStrategies(options)
  configureRoutes(options)
}

export {configure, sessionOrToken, createAuthMiddleware, createInternalMiddleware, AccessToken, RefreshToken, createToken, findOrCreateAccessToken}
