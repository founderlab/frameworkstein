import fs from 'fs'
import { promisify } from 'util'
import path from 'path'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
// import models from './data/models'
import generateFiles from '../src/generate/generateFiles'
import { parseModelsFromSchema } from '../src/parse/parseSchema'


const readFile = promisify(fs.readFile)
const SCHEMA_FILE = path.join(process.cwd(), './__tests__/data/exampleGraphqlSchema.txt')
const TEMP_DIR = path.join(process.cwd(), './.tmp')
console.log('TEMP_DIR', TEMP_DIR)

describe('Model Generation', () => {

  beforeAll(() => {
    rimraf.sync(TEMP_DIR)
    mkdirp.sync(TEMP_DIR)
  })

  it('creates model files from a list of models', async () => {
    const schema = await readFile(SCHEMA_FILE, 'utf8')
    const models = parseModelsFromSchema(schema)

    const options = {
      models,
      root: TEMP_DIR,
    }
    await generateFiles(options)
  })
})
