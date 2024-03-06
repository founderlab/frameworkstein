import _ from 'lodash'
import { createToken } from '../lib'
import LocalStrategy from './Local'


export default class RegisterStrategy extends LocalStrategy {

  async verify(req, email, password, callback) {
    try {
      const User = this.User
      const existingUser = await User.findOne(this.userQuery(email))
      if (existingUser) return callback(null, false, 'User already exists')

      const extraParams = _.pick(req.body, this.extraRegisterParams)
      const user = new User({ email, password: User.createHash(password), emailConfirmationToken: createToken(), ...extraParams })
      await user.save()

      if (user.onCreate) {
        const createResult = await user.onCreate({ req })
        if (createResult && createResult.invalid) {
          return callback(null, false, createResult.message)
        }
      }

      this.sendConfirmationEmail(user, err => {
        if (err) console.log('[fl-auth] Error sending confirmation email', err)
      })

      callback(null, user)
    }
    catch (err) {
      callback(err)
    }
  }
}
