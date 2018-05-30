import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/profiles`,
  schema: () => _.extend({
    user: () => ['belongsTo', require('./User')],
  }, require('../../shared/models/schemas/profile')),
})
export default class Profile extends Model {
  defaults = () => ({
    deleted: false,
    visible: true,
    createdDate: moment.utc().toDate(),
  })
}
