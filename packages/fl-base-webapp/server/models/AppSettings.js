import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/app_settings`,
  schema: require('../../shared/models/schemas/appSettings'),
})
export default class AppSettings extends Model {
  defaults = () => ({
    createdDate: moment.utc().toDate(),
  })
}
