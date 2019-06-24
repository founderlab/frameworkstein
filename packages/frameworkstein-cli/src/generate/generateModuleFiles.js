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
import createModelCreate from '../templates/shared/module/components/ExampleModelCreate'
import createModelDetail from '../templates/shared/module/components/ExampleModelDetail'
import createModelEdit from '../templates/shared/module/components/ExampleModelEdit'
import createModelList from '../templates/shared/module/components/ExampleModelList'
import createModelCreateContainer from '../templates/shared/module/containers/ExampleModelCreate'
import createModelDetailContainer from '../templates/shared/module/containers/ExampleModelDetail'
import createModelEditContainer from '../templates/shared/module/containers/ExampleModelEdit'
import createModelListContainer from '../templates/shared/module/containers/ExampleModelList'


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
      path: path.join(options.root, `shared/modules/${model.variablePlural}/components/forms/${model.className}Form.js`),
      content: createForm(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/components/${model.className}Create.js`),
      content: createModelCreate(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/components/${model.className}Detail.js`),
      content: createModelDetail(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/components/${model.className}Edit.js`),
      content: createModelEdit(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/components/${model.className}List.js`),
      content: createModelList(model),
    },

    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/containers/${model.className}Create.js`),
      content: createModelCreateContainer(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/containers/${model.className}Detail.js`),
      content: createModelDetailContainer(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/containers/${model.className}Edit.js`),
      content: createModelEditContainer(model),
    },
    {
      path: path.join(options.root, `shared/modules/${model.variablePlural}/containers/${model.className}List.js`),
      content: createModelListContainer(model),
    },
  ]

  await writeFiles(output, options)
}
