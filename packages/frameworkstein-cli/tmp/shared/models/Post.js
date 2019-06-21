import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/posts',
})
export default class Post extends Model {
  static schema = () => _.extend({

    author: () => ['belongsTo', require('./Author')]

  }, require('./schemas/post'))

}
