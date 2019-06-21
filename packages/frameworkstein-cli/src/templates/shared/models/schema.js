export default (model) =>
`export default {
${model.fields.map(field => `  ${field.name}: '${field.type}',`).join('\n')}
  updatedDate: 'DateTime',
  createdDate: 'DateTime',
}
`
