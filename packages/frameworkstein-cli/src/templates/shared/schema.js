import _ from 'lodash'

export default (options) =>
`export default {${_.map(options.fields, field => ``)}
  updatedDate: 'DateTime',
  createdDate: 'DateTime',
}
`
