import renderRelations from '../../lib/renderRelations'

export default options =>
`import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: \`\$\{dbUrl\}/${options.tableName}\`,
})
export default class ${options.className} extends Model {

  static schema = () => _.extend({
    ${renderRelations(options.relations)}
  }, require('../../shared/models/schemas/${options.variableName}'))

  defaults() {
    return {

    }
  }
}
`
