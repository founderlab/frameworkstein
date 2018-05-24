import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'
import { createToken } from '../lib'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/accessTokens`,
  schema: () => ({
    createdDate: ['DateTime', {indexed: true}],
    expiresDate: ['DateTime', {indexed: true}],
    token: ['Text', {indexed: true}],

    // Leave the user relation out to allow for drop in replacement of user models,
    // then add this field to the schema to ensure column creation in sql.
    user_id: ['Integer', {indexed: true}],

    refreshToken: () => ['belongsTo', require('./RefreshToken')],
  })
})
export default class AccessToken extends Model {

  static defaults = () => ({
    createdDate: moment.utc().toDate(),
    token: createToken(),
  })

}
