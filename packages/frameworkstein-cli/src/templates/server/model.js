
export default options =>
`import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import {smartSync} from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class ${options.className} extends Backbone.Model {
  url = \`\$\{dbUrl\}/${options.tableName}\`

  schema = () => _.extend({

  }, require('../../shared/models/schemas/${options.variableName}'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

${options.className}.prototype.sync = smartSync(dbUrl, ${options.className})
`
