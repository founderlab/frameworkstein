import moment from 'moment'
import Backbone from 'backbone'
import {createToken} from '../lib'

const dbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class AccessToken extends Backbone.Model {
  url = `${dbUrl}/accessTokens`
  schema = () => ({
    createdDate: ['DateTime', {indexed: true}],
    expiresDate: ['DateTime', {indexed: true}],
    token: ['String', {indexed: true}],

    // Leave the user relation out to allow for drop in replacement of user models,
    // then add this field to the schema to ensure column creation in sql.
    user_id: ['Integer', {indexed: true}],

    refreshToken: () => ['belongsTo', require('./RefreshToken')],
  })

  defaults() {
    return {
      createdDate: moment.utc().toDate(),
      token: createToken(),
    }
  }

}

if (dbUrl.split(':')[0] === 'mongodb') {
  AccessToken.prototype.sync = require('backbone-mongo').sync(AccessToken)
}
else {
  AccessToken.prototype.sync = require('fl-backbone-sql').sync(AccessToken)
}
