import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { beforeSend } from '../lib/headers'

export default class Profile extends Backbone.Model {
  schema = () => _.extend({

    user: () => ['belongsTo', require('./User')],

  }, require('./schemas/profile'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

Profile.prototype.urlRoot = '/api/profiles'
Profile.prototype.sync = require('backbone-http').sync(Profile, {beforeSend})
