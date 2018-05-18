import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import { beforeSend } from '../lib/headers'

export default class AppSetting extends Backbone.Model {
  schema = () => _.extend({

  }, require('./schemas/appSettings'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

AppSetting.prototype.urlRoot = '/api/app_settings'
AppSetting.prototype.sync = require('backbone-http').sync(AppSetting, {beforeSend})
