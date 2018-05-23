import LocalStrategy from './Local'

// Strategy to log a user in using their username/password
export default class PasswordStrategy extends LocalStrategy {

  verify(req, email, password, callback) {
    const User = this.User
    User.findOne(this.userQuery(email), (err, user) => {
      if (err) return callback(err)
      if (!user) {
        console.log('[fl-auth] email error: user not found', email)
        return callback(null, false, 'User not found')
      }
      if (user.get('linkedInId') && !user.get('password')) {
        return callback(null, false, 'Registered by LinkedIn')
      }
      if (!user.passwordIsValid(password)) {
        return callback(null, false, 'Incorrect password')
      }
      callback(null, user)
    })
  }
}
