import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/users',
  schema: () => _.extend({
    profile: () => ['hasOne', require('./Profile')],
  }, require('../../shared/models/schemas/user')),
})
export default class User extends Model {

}
