import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/static_pages',
  schema: () => _.extend({
  }, require('./schemas/profile')),
})
export default class StaticPage extends Model {

}
