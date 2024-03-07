import LocalStrategy from './Local'


// Strategy to log a user in using their username/password
export default class PasswordStrategy extends LocalStrategy {

  async verify(req, email, password, callback) {
    try {
      const User = this.User
      const user = await User.findOne(this.userQuery(email))

      if (!user) {
        console.log('[fl-auth] email error: user not found', email)
        return callback(null, false, 'User not found')
      }

      if ((user.get('linkedInId') || user.get('linkedinId')) && !user.get('password')) {
        return callback(null, false, 'Registered by LinkedIn')
      }

      if (!user.passwordIsValid(password)) {
        return callback(null, false, 'Incorrect password')
      }

      if (User.onLogin) {
        try {
          const onLoginResult = await User.onLogin({ req, user })
          if (onLoginResult && onLoginResult.invalid) {
            return callback(null, false, onLoginResult.message)
          }
        }
        catch (err) {
          console.log('[fl-auth] User.onLogin error', err, user)
          return callback(err, user)
        }
      }
      callback(null, user)
    }
    catch (err) {
      console.log(err)
      callback(err)
    }
  }
}
