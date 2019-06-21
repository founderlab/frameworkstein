
export default model =>
`import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/${model.tableName}',
})
export default class ${model.className} extends Model {
  static schema = () => _.extend({

${model.relations.map(relation => `    ${relation.name}: () => ['${relation.relationType}', require('./${relation.modelType}')]`).join('\n')}

  }, require('./schemas/${model.variableName}'))

}
`
