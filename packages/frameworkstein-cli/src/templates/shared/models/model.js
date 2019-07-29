import renderRelations from '../../../templateHelpers/renderRelations'

export default model =>
`import { createModel, Model } from 'stein-orm-http'


@createModel({
  url: '/api/${model.tableName}',
})
export default class ${model.className} extends Model {

  static schema = () => ({
${renderRelations(model.relations)}
    ...require('./schemas/${model.variableName}'),
  })

}
`
