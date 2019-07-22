import fs from 'fs'
import chalk from 'chalk'
import { promisify } from 'util'
import generateFiles from '../generate/generateFiles'
import { parseModelsFromSchema } from '../parse/parseSchema'


const readFile = promisify(fs.readFile)

export default async function createSchema(options) {
  try {
    const schema = await readFile(options.filename, 'utf8')
    const models = parseModelsFromSchema(schema)
    await generateFiles({models, ...options})
    console.log(chalk.green('done'))
  }
  catch (err) {
    console.log(chalk.red(err.message))
  }
}
