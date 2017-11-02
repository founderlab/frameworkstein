import moment from 'moment'
import Backbone from 'backbone'
import bcrypt from 'bcrypt-nodejs'

const dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class User extends Backbone.Model {
  url = `${dbUrl}/users`
  schema = () => ({
    // accessTokens: () => ['hasMany', require('./AccessToken')],
  })

  static createHash(password) { return bcrypt.hashSync(password) }

  defaults() { return {createdDate: moment.utc().toDate()} }

  passwordIsValid(password) { return bcrypt.compareSync(password, this.get('password')) }

}

if (dbUrl.split(':')[0] === 'mongodb') {
  User.prototype.sync = require('backbone-mongo').sync(User)
}
else {
  User.prototype.sync = require('fl-backbone-sql').sync(User)
}
