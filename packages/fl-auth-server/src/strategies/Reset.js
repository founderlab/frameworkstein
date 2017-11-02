import moment from 'moment'
import LocalStrategy from './Local'

export default class ResetStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User

    const {resetToken} = req.body
    if (!resetToken) return callback(null, null, 'No token provided')

    User.findOne({email, resetToken}, (err, user) => {
      if (err) return callback(err)
      if (!user) return callback(null, null, 'No user found with this token')

      if (moment.utc().diff(moment(user.get('resetTokenCreatedDate'))) > this.resetTokenExpiresMs) callback(null, null, 'This token has expired')

      user.save({
        password: User.createHash(password),
        resetToken: null,
        resetTokenCreatedDate: null,
      }, callback)

    })
  }
}
