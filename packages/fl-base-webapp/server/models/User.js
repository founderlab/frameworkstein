import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs'
import { wrapById } from '../cache/users'
let Profile

const LAST_ACTIVE_UPDATE_INTERVAL = 5 * 60 * 60 * 1000

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

function locationObj(location) {
  if (!location) return {}
  const split = (location.name || '').split(',')
  const city = (split[0] || '').trim()
  const country = (split[1] || '').trim()
  return {
    countryCode: location.country && location.country.code,
    city,
    country,
  }
}

export default class User extends Backbone.Model {
  url = `${dbUrl}/users`

  schema = () => _.extend({
    profile: () => ['hasOne', Profile = require('./Profile')],
  }, require('../../shared/models/schemas/user'))

  static createHash(password) { return bcrypt.hashSync(password) }

  defaults() { return {createdDate: moment.utc().toDate()} }


  // Handle a bunch of user onboarding tasks
  // TODO: Does not handle a mentor that has registered for one community wanting to be a mentor on another
  onCreate(_options, _callback) {
    let callback
    let options
    if (_callback) {
      callback = _callback
      options = _options
    }
    else {
      callback = _options
      options = {}
    }
    this.createProfile((err, profile) => {
      if (err) return callback(err)
      callback(null, {user: this.toJSON, profile: profile.toJSON()})
    })
  }

  createProfile(callback) {
    const profile = new Profile({
      user: this,
      firstName: '',
      lastName: '',
      emailMd5: crypto.createHash('md5').update(this.get('email')).digest('hex'),
    })

    profile.save(err => {
      if (err) return callback(err)
      callback(null, profile)
    })
  }

  static deserializeUser(id, callback) {
    if (process.env.VERBOSE) console.time(`deserializeUser_${id}`)
    const getUser = callback => User._deserializeUser(id, callback)
    const done = (err, user) => {
      if (process.env.VERBOSE) console.timeEnd(`deserializeUser_${id}`)

      const now = new Date()

      if (!user.lastActiveDate || (now.getTime() - user.lastActiveDate > LAST_ACTIVE_UPDATE_INTERVAL)) {
        const userModel = new User(user)
        userModel.save({lastActiveDate: now}, err => err && console.log(err))
      }

      callback(err, user)
    }
    return wrapById(id, getUser, done)
  }

  static _deserializeUser(id, callback) {
    User.cursor({id, $one: true}).toJSON((err, user) => {
      if (err || !user) return callback(err, null)
      callback(err, user)
    })
  }

  passwordIsValid(password) {
    if (!this.get('password')) return false
    return bcrypt.compareSync(password, this.get('password'))
  }
}

User.prototype.sync = smartSync(dbUrl, User)
