import _ from 'lodash'
import { Strategy } from 'passport'
import { findOrCreateAccessToken } from '../lib'


export default class LocalStrategy extends Strategy {
  constructor(options={}, verify) {
    super()
    _.merge(this, options)
    if (!this.User) throw new Error('[fl-auth] LocalStrategy: Missing User from options')
    if (verify) this.verify = verify.bind(this)
  }

  authenticate(req) {
    const email = (req.body && req.body[this.usernameField]) || (req.query && req.query[this.usernameField])
    const password = (req.body && req.body[this.passwordField]) || (req.query && req.query[this.passwordField])
    if (!this.isValidUsername(email) || !password) return this.fail(this.badRequestMessage)

    this.verify(req, email.trim(), password, async (err, user, info) => {
      if (err) return this.error(err)
      if (!user) return this.fail(info)

      try {
        const { token, refreshToken, info } = await findOrCreateAccessToken({user_id: user.id})

        if (!req.session) {
          const msg = '[fl-auth] LocalStrategy: Missing session from req. Is redis running?'
          console.log(msg)
          return this.error(new Error(msg))
        }

        req.session.accessToken = {token, expiresDate: info.expiresDate}
        req.session.save(err => {if (err) console.log('[fl-auth] Error saving session', err)})
        this.success(_.omit(user.toJSON(), 'password'), {accessToken: token})
      }
      catch (err) {
        return this.error(err)
      }
    })
  }
}
