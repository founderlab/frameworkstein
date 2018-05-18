import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class Profile extends Backbone.Model {
  url = `${dbUrl}/profiles`

  schema = () => _.extend({

    user: () => ['belongsTo', require('./User')],

  }, require('../../shared/models/schemas/profile'))

  defaults() { return {deleted: false, visible: true, createdDate: moment.utc().toDate()} }
}

Profile.prototype.sync = smartSync(dbUrl, Profile)
