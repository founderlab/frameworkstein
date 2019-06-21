import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/authors',
})
export default class Author extends Model {
  static schema = () => _.extend({

    posts: () => ['hasMany', require('./Post')]

  }, require('./schemas/author'))

}
