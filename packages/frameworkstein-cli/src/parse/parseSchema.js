import _ from 'lodash'
import program from 'commander'
import { parse } from 'graphql'
import { isCustomObject, translateType } from './dataTypes'
import modelNames from './modelNames'


export function parseModelsFromSchema(schema) {
  const parsedSchema = parse(schema)
  const models = []

  for (const definition of parsedSchema.definitions) {
    let model = {
      name: definition.name.value,
      root: process.cwd() + '/api-test',
      force: program.force,
      verbose: program.verbose,
      modelType: definition.name.value,
    }
    const fields = []
    const relations = []

    for (const field of definition.fields) {
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
    }

    model = {...model, ...modelNames(model.name)}
    models.push(model)
  }

  for (const model of models) {
    for (const relation of model.relations) {
      relation.model = _.find(models, m => m.modelType === relation.modelType)
      if (relation.relationType === 'hasMany') {
        const reverseRelation = _.find(relation.model.relations, m => m.modelType === model.modelType)
        if (reverseRelation.relationType === 'hasMany') relation.m2m = true
      }
    }
  }

  return models
}
