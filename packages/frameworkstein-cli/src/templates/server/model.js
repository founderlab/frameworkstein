import renderRelations from '../../templateHelpers/renderRelations'

export default model =>
`import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: \`\$\{dbUrl\}/${model.tableName}\`,
})
export default class ${model.className} extends Model {

  static schema = () => _.extend({

${renderRelations(model.relations)}

  }, require('../../shared/models/schemas/${model.variableName}'))

  defaults() {
    return {

    }
  }
}
`
