
export default options =>
`import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'

export default class ${options.className} extends Backbone.Model {
  schema = () => _.extend({

  }, require('./schemas/${options.variableName}'))

  defaults() { return {createdDate: moment.utc().toDate()} }
}

${options.className}.prototype.urlRoot = '/api/${options.tableName}'
${options.className}.prototype.sync = require('backbone-http').sync(${options.className})
`
