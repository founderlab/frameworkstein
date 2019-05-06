import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/test_models',
})
export default class TestModel extends Model {
  static schema = () => _.extend({

  }, require('./schemas/testModel'))

}
