import _ from 'lodash'
import moment from 'moment'
import { Strategy } from 'passport'
import { parseAuthHeader, logout } from '../lib'
import AccessToken from '../models/AccessToken'

const defaults = {
  name: 'bearer',
  checkRequest: true,
  checkCookies: true,
}

// bearer token that considers request and cookies
export default class BearerStrategy extends Strategy {

  constructor(options, verify) {
    super(options)
    _.defaults(options, defaults)
    _.merge(this, options)
    if (!this.User) throw new Error('[fl-auth] PasswordStrategy: Missing User from options')
    if (verify) this.verify = verify
  }

  verify(req, token, callback) {
    AccessToken.cursor({token, $one: true}).toJSON((err, accessToken) => {
      if (err || !accessToken) return callback(err, false)

      req._passport.instance.deserializeUser(accessToken.user_id, (err, user) => {
        if (err) return callback(err)
        callback(null, user)
      })

      // todo: when to refresh tokens?
      // const expiresDate = accessToken.expiresDate

      // if (expiresDate && moment().isAfter(expiresDate)) {
      //   this.refreshToken(accessToken.refreshToken, (err, newAccessToken) => {
      //     if (err || !newAccessToken) {
      //       logout()
      //       return res.redirect(302, `/login?redirectTo=${req.url}`)
      //     }
      //     req.session.accessToken = newAccessToken
      //     req.session.save(err => { if (err) console.log('Failed to save access token to session during refresh') } )
      //     next()
      //   })

      // } else next()

      // User.findOne(accessToken.user_id, (err, user) => {
      //   if (err) return callback(err)
      //   callback(null, user)
      // })
    })
  }

  refreshToken(refreshToken, callback) {
    callback()
  }

  authenticate(req) {
    let token = null

    if (req.headers && req.headers.authorization) token = parseAuthHeader(req, 'Bearer')

    if (this.checkRequest && !token) token = ((req.query && req.query.$accessToken) || (req.body && req.body.$accessToken))
    if (req.body && req.body.$accessToken) delete req.body.$accessToken

    if (this.checkCookies && !token && req.cookies) token = req.cookies.accessToken

    if (!token) return this.fail(401)

    this.verify(req, token, (err, user, info) => {
      if (err) return this.error(err)
      if (!user) return this.fail(401)
      this.success(user, info)
    })
  }

}
