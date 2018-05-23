import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'
// import { smartSync } from 'fl-server-utils'
import slugify from 'slugify'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/static_pages`,
  schema: require('../../shared/models/schemas/staticPage'),
})
export default class StaticPage extends Model {
  defaults() { return {createdDate: moment.utc().toDate()} }

  static slugify = string => slugify(string.toLowerCase())
}
