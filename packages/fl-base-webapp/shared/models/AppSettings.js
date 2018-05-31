import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/app_settings',
  schema: () => _.extend({
  }, require('./schemas/appSettings')),
})
export default class AppSettings extends Model {

}
