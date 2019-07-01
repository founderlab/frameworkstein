import program from 'commander'
import { parse } from 'graphql'
import { isCustomObject, translateType } from './dataTypes'

export function parseModelsFromSchema(schema) {
  const parsedSchema = parse(schema)
  const models = []
  parsedSchema.definitions.map((definition) => {
    let model = {
      name: definition.name.value,
      root: process.cwd() + '/api-test',
      force: program.force,
      verbose: program.verbose,
      modelType: definition.name.value,
    }
    const fields = []
    const relations = []
    definition.fields.map((field) => {
      const modelType = field.type.type ? translateType(field.type.type.name.value) : translateType(field.type.name.value)
      if (isCustomObject(modelType)) {
        fields.push({
          name: field.name.value,
        })
        relations.push({
          name: field.name.value,
          modelType,
          relationType: field.type.kind === 'ListType' ? 'hasMany' : 'belongsTo',
        })
      }
      else if (field.name.value !== 'id') {
        fields.push({
          name: field.name.value,
          type: modelType,
        })
      }
      model = {
        ...model,
        fields,
        relations,
      }
    })
    models.push(model)
  })
  console.log('models', JSON.stringify(models))
  return models
}
