import moment from 'moment'
import Backbone from 'backbone'
import {createToken} from '../lib'

const dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class RefreshToken extends Backbone.Model {
  url = `${dbUrl}/refreshTokens`
  schema = () => ({
    createdDate: ['DateTime', {indexed: true}],
    expiresDate: ['DateTime', {indexed: true}],
    token: ['String', {indexed: true}],

    user_id: ['Integer', {indexed: true}],

    // accessTokens: () => ['hasMany', require('./AccessToken')],
  })

  defaults() {
    return {
      createdDate: moment.utc().toDate(),
      token: createToken(),
    }
  }

}

if (dbUrl.split(':')[0] === 'mongodb') {
  RefreshToken.prototype.sync = require('backbone-mongo').sync(RefreshToken)
}
else {
  RefreshToken.prototype.sync = require('fl-backbone-sql').sync(RefreshToken)
}
