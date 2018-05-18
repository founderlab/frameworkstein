import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { beforeSend } from '../lib/headers'

export default class User extends Backbone.Model {
  schema = () => _.extend({

    profile: () => ['hasOne', require('./Profile')],

  }, require('./schemas/user'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

User.prototype.urlRoot = '/api/users'
User.prototype.sync = require('backbone-http').sync(User, {beforeSend})
