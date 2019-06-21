import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/posts`,
})
export default class Post extends Model {

  static schema = () => _.extend({


  }, require('../../shared/models/schemas/post'))

  defaults() {
    return {

    }
  }
}
