import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class AppSettings extends Backbone.Model {
  url = `${dbUrl}/app_settings`

  schema = () => _.extend({

  }, require('../../shared/models/schemas/appSettings'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

AppSettings.prototype.sync = smartSync(dbUrl, AppSettings)
