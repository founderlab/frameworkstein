export default (model) =>
`export default {${model.fields.map(field => field.type ? `\n  ${field.name}: '${field.type}',` : '').join('')}
  updatedDate: 'DateTime',
  createdDate: 'DateTime',
}
`
