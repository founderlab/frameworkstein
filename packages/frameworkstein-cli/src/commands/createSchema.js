import fs from 'fs'
import chalk from 'chalk'
import { promisify } from 'util'
import generateModuleFiles from '../generate/generateModuleFiles'
import { parseModelsFromSchema } from '../parse/parseSchema'


const readFile = promisify(fs.readFile)

export default async function createSchema(options) {
  console.log('createSchema', options)
  try {

    const schema = await readFile(options.filename, 'utf8')
    console.log('schema', schema)

    const models = parseModelsFromSchema(schema)
    console.log('models', models)

    for (const model of models) {
      try {
        await generateModuleFiles(model, options)
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
