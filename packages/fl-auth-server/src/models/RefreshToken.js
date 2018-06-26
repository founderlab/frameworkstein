import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'
import { createToken } from '../lib'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/refreshTokens`,
  schema: () => ({
    createdDate: ['DateTime', {indexed: true}],
    expiresDate: ['DateTime', {indexed: true}],
    token: ['String', {indexed: true}],

    user_id: ['Integer', {indexed: true}],

    accessTokens: () => ['hasMany', require('./AccessToken')],
  })
})
export default class RefreshToken extends Model {
  defaults() {
    return {
      createdDate: moment.utc().toDate(),
      token: createToken(),
    }
  }
}
