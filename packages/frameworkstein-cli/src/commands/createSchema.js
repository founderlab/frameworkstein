// call createModel from lib
import chalk from 'chalk'
import { schema } from '../examples/exampleGraphqlSchema'
import createModel from '../lib/createModel'
import { parseModelsFromSchema } from '../lib/parseSchema'

export default function createSchema(_options, _callback) {

  parseModelsFromSchema(schema).map((model) => {
    createModel(model, err => {
      if (err) return console.log(chalk.red(err.message))
      console.log(chalk.green('done'))
    })
  })

}

  // options.actionName = options.tableName.toUpperCase()
