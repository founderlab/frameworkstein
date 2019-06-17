import _ from 'lodash' // eslint-disable-line
import chalk from 'chalk' // eslint-disable-line
import fs from 'fs'
import path from 'path'
import Queue from 'queue-async'
import mkdirp from 'mkdirp'
import inflection from 'inflection'
import createServerModel from '../templates/server/model'
import createServerController from '../templates/server/controller'
import createServerTemplate from '../templates/server/template'
import createSharedModel from '../templates/shared/models/model'
import createSharedSchema from '../templates/shared/models/schema'


export default function createModel(_options, callback) {
  const options = {
    className: inflection.classify(_options.name),
    tableName: inflection.tableize(_options.name),
    variableName: inflection.camelize(_options.name, true),
    ..._options,
  }
  options.variablePlural = inflection.pluralize(options.variableName)
  options.classPlural = inflection.pluralize(options.className)
  options.actionName = options.tableName.toUpperCase()

  const output = {
    serverModel: {
      path: path.join(options.root, `server/models/${options.className}.js`),
      content: createServerModel(options),
    },
    serverController: {
      path: path.join(options.root, `server/api/controllers/${options.classPlural}.js`),
      content: createServerController(options),
    },
    serverTemplate: {
      path: path.join(options.root, `server/api/templates/${options.variablePlural}/base.js`),
      content: createServerTemplate(options),
    },
    sharedModel: {
      path: path.join(options.root, `shared/models/${options.className}.js`),
      content: createSharedModel(options),
    },
    sharedSchema: {
      path: path.join(options.root, `shared/models/schemas/${options.variableName}.js`),
      content: createSharedSchema(options),
    },
  }

  const queue = new Queue()

  _.forEach(output, out => {
    if (!options.force && fs.existsSync(out.path)) {
      return callback(new Error(`File already exists at ${out.path}. Use --force to overwrite`))
    }
    queue.defer(callback => {
      mkdirp(path.dirname(out.path), err => {
        if (err) return callback(err)
        console.log(' ', chalk.green('Creating file:'), out.path)
        if (options.verbose) {
          console.log('---------------------')
          console.log(chalk.yellow(out.content))
          console.log('---------------------')
        }
        fs.writeFile(out.path, out.content, callback)
      })
    })
  })

  queue.await(callback)

}
