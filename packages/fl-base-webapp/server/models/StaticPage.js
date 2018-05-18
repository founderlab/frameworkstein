import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'
import slugify from 'slugify'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class StaticPage extends Backbone.Model {
  url = `${dbUrl}/static_pages`

  schema = () => _.extend({

  }, require('../../shared/models/schemas/staticPage'))

  defaults() { return {createdDate: moment.utc().toDate()} }

  static slugify = string => slugify(string.toLowerCase())
}

StaticPage.prototype.sync = smartSync(dbUrl, StaticPage)
