import _ from 'lodash'
import { createToken } from '../lib'
import LocalStrategy from './Local'

export default class RegisterStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User
    User.findOne(this.userQuery(email), (err, existingUser) => {
      if (err) return callback(err)
      if (existingUser) return callback(null, false, 'User already exists')

      const extraParams = _.pick(req.body, this.extraRegisterParams)
      const user = new User({email, password: User.createHash(password), emailConfirmationToken: createToken(), ...extraParams})
      user.save(err => {
        if (err) return callback(err)

        if (user.onCreate) {
          user.onCreate({req}, err => {
            callback(err, user)
            this.sendConfirmationEmail(user, err => {
              if (err) console.log('[fl-auth] Error sending confirmation email', err)
            })
          })
        }
        else {
          callback(null, user)
          this.sendConfirmationEmail(user, err => {
            if (err) console.log('[fl-auth] Error sending confirmation email', err)
          })
        }
      })
    })
  }
}
