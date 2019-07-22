import chalk from 'chalk'
import generateModuleFiles from '../generate/generateModuleFiles'
import { parseModelsFromSchema } from '../parse/parseSchema'


import { schema } from '../examples/exampleGraphqlSchema'


export default async function createSchema(options) {
  try {
    const models = parseModelsFromSchema(schema)

    for (const model of models) {
      try {
        await generateModuleFiles(model)
      }
      catch (err) {
        console.log(chalk.red(err.message))
      }
    }
    console.log(chalk.green('done'))
  }
  catch (err) {
    console.log(chalk.red(err.message))
  }
}
