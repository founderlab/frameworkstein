import _ from 'lodash' // eslint-disable-line
import chalk from 'chalk' // eslint-disable-line
import path from 'path'
import writeFiles from './writeFiles'
import generateNames from './generateNames'
import generateModuleFiles from './generateModuleFiles'
import generateConfigureAdmin from '../templates/shared/configureAdmin'
import generateReducer from '../templates/shared/reducer'


export default async function generateFiles(options) {
  try {
    if (!options.root) throw new Error('Missing options.root')
    if (!options.models) throw new Error('Missing options.models')

    const { models } = options

    for (const model of models) {
      const names = generateNames(model.name)
      model.fields = model.fields || []
      model.relations = model.relations || []
      _.extend(model, names)
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

    for (const model of models) {
      await generateModuleFiles(model, options)
    }

    const output = [
      {
        path: path.join(options.root, `shared/reducer.js`),
        content: generateReducer(options),
      },
      {
        path: path.join(options.root, `shared/configureAdmin.js`),
        content: generateConfigureAdmin(options),
      },
    ]

    await writeFiles(output, options)
  }
  catch (err) {
    console.log(err)
  }
}
