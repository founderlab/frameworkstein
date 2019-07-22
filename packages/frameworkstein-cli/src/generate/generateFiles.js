import _ from 'lodash' // eslint-disable-line
import chalk from 'chalk' // eslint-disable-line
import path from 'path'
import writeFiles from './writeFiles'
import generateModuleFiles from './generateModuleFiles'
import generateConfigureAdmin from '../templates/shared/configureAdmin'
import generateReducer from '../templates/shared/reducer'
import generateRoutes from '../templates/shared/routes/index'


export default async function generateFiles(options) {
  try {
    if (!options.root) throw new Error('Missing options.root')
    if (!options.models) throw new Error('Missing options.models')

    const { models } = options

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
      {
        path: path.join(options.root, `shared/routes/index.js`),
        content: generateRoutes(options),
      },
    ]

    await writeFiles(output, options)
  }
  catch (err) {
    console.log(err)
  }
}
