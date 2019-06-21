import _ from 'lodash' // eslint-disable-line
import chalk from 'chalk' // eslint-disable-line
import path from 'path'
import writeFiles from './writeFiles'
import createServerModel from '../templates/server/model'
import createServerController from '../templates/server/controller'
import createServerTemplate from '../templates/server/template'
import createSharedModel from '../templates/shared/models/model'
import createSharedSchema from '../templates/shared/models/schema'
import createForm from '../templates/shared/module/components/forms/ExampleModelForm'


export default async function generateModuleFiles(model, options) {
  const output = [
    {
      path: path.join(options.root, `server/models/${model.className}.js`),
      content: createServerModel(model),
    },
    {
      path: path.join(options.root, `server/api/controllers/${model.classPlural}.js`),
      content: createServerController(model),
    },
    {
      path: path.join(options.root, `server/api/templates/${model.variablePlural}/base.js`),
      content: createServerTemplate(model),
    },
    {
      path: path.join(options.root, `shared/models/${model.className}.js`),
      content: createSharedModel(model),
    },
    {
      path: path.join(options.root, `shared/models/schemas/${model.variableName}.js`),
      content: createSharedSchema(model),
    },

    {
      path: path.join(options.root, `shared/modules/${model.variableName}/components/forms/${model.className}Form.js`),
      content: createForm(model),
    },
  ]

  await writeFiles(output, options)
}
