
export default options =>
`import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/${options.tableName}',
})
export default class ${options.className} extends Model {
  static schema = () => _.extend({

  }, require('./schemas/${options.variableName}'))

}
`
