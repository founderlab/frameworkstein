import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/profiles',
  schema: () => _.extend({
    user: () => ['belongsTo', require('./User')],
  }, require('../../shared/models/schemas/profile')),
})
export default class Profile extends Model {

}
