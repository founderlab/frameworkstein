import _ from 'lodash'
import passport from 'passport'
import {Strategy as FacebookStrategy} from 'passport-facebook'
import {Strategy as LinkedInStrategy} from 'passport-linkedin-oauth2'
import {BearerStrategy, PasswordStrategy, RegisterStrategy, ResetStrategy, FacebookMobileStrategy} from '../strategies'

export function configureFacebook(options, strategyOptions) {
  if (!options.facebook.clientId) return console.log('[fl-auth-server] Missing facebook option clientId, got', options.facebook)
  if (!options.facebook.clientSecret) return console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.facebook)

  const User = options.User
  passport.use(new FacebookStrategy({
    clientID: options.facebook.clientId,
    clientSecret: options.facebook.clientSecret,
    callbackURL: options.facebook.url + options.facebook.paths.callback,
    profileFields: options.facebook.profileFields,
    passReqToCallback: true,
  },
  (req, token, refreshToken, profile, callback) => {
    const email = _.get(profile, 'emails[0].value', '')
    if (!email) return callback(new Error(`[fl-auth] FacebookStrategy: No email from Facebook, got profile: ${JSON.stringify(profile)}`))

    User.findOne({facebookId: profile.id}, (err, existingUser) => {
      if (err) return callback(err)
      const user = existingUser || new User({email})
      const isNew = !existingUser

      user.save({facebookId: profile.id, facebookAccessToken: token}, err => {
        if (err) return callback(err)
        options.facebook.onLogin({user, profile, isNew, req}, err => {
          if (err) return callback(err)
          callback(null, user)
        })
      })
    })
  }))

  passport.use('facebookMobile', new FacebookMobileStrategy(_.extend({}, strategyOptions, {facebook: options.facebook})))
}

export function configureLinkedIn(options) {
  if (!options.linkedIn.clientId) console.log('[fl-auth-server] Missing linkedIn option clientId, got', options.linkedIn)
  if (!options.linkedIn.clientSecret) console.log('[fl-auth-server] Missing facebook option clientSecret, got', options.linkedIn)

  const User = options.User
  passport.use(new LinkedInStrategy({
    clientID: options.linkedIn.clientId,
    clientSecret: options.linkedIn.clientSecret,
    callbackURL: options.linkedIn.url + options.linkedIn.paths.callback,
    profileFields: options.linkedIn.profileFields,
    scope: options.linkedIn.scope,
    state: true,
    passReqToCallback: true,
  },
  (req, token, refreshToken, profile, callback) => {
    const email = _.get(profile, 'emails[0].value', '')
    if (!email) return callback(new Error(`[fl-auth] LinkedInStrategy: No email from LinkedIn, got profile: ${JSON.stringify(profile)}`))

    User.findOne({linkedInId: profile.id}, (err, existingUser) => {
      if (err) return callback(err)

      const user = existingUser || new User({email})
      const isNew = !existingUser

      user.save({linkedInId: profile.id, linkedInAccessToken: token}, err => {
        if (err) return callback(err)

        options.linkedIn.onLogin({user, profile, isNew, req}, err => {
          if (err) return callback(err)
          callback(null, user)
        })
      })
    })
  }))
}

export default function configureStrategies(options={}) {
  const User = options.User
  if (!User) throw new Error(`[fl-auth] Missing User model from configureStrategies, got ${options}`)

  // passport functions
  const strategyOptions = {User, sendConfirmationEmail: options.sendConfirmationEmail, ...options.login}
  passport.use('password', new PasswordStrategy(strategyOptions))
  passport.use('register', new RegisterStrategy(strategyOptions))
  passport.use('bearer', new BearerStrategy(strategyOptions))
  passport.use('reset', new ResetStrategy(strategyOptions))

  if (options.facebook) configureFacebook(options, strategyOptions)
  if (options.linkedIn) configureLinkedIn(options)
}
