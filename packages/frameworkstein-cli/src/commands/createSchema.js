import fs from 'fs'
import chalk from 'chalk'
import { promisify } from 'util'
import generateFiles from '../generate/generateFiles'
import { parseModelsFromSchema } from '../parse/parseSchema'


const readFile = promisify(fs.readFile)

export default async function createSchema(options) {
  console.log('createSchema', options)
  try {

    const schema = await readFile(options.filename, 'utf8')
    console.log('schema', schema)

    const models = parseModelsFromSchema(schema)
    console.log('models', models)

    await generateFiles({models, ...options})

    console.log(chalk.green('done'))
  }
  catch (err) {
    console.log(chalk.red(err.message))
  }
}
