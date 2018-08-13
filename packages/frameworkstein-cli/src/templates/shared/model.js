
export default options =>
`import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/${options.tableName}',
})
export default class ${options.className} extends Model {
  static schema = () => _.extend({

  }, require('./schemas/${options.variableName}'))

}
`
