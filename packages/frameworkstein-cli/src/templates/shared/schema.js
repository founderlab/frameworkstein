import _ from 'lodash'

export default (options) =>
`export default {
  ${_.map(options.fields, field => field.type && field.name + ': \'' + field.type + '\',\n').join('  ')}
  updatedDate: 'DateTime',
  createdDate: 'DateTime',
}
`
