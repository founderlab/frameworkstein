import chalk from 'chalk'
import generateModuleFiles from '../generate/generateModuleFiles'
import modelNames from '../parse/modelNames'


export default async function createModel(options) {
  try {
    const model = {
      name: options.name,
      fields: [],
      relations: [],
      ...modelNames(options.name),
    }
    await generateModuleFiles(model)
  }
  catch (err) {
    console.log(chalk.red(err.message))
  }
  console.log(chalk.green('done'))
}
