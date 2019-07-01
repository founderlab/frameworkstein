import path from 'path'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import models from './data/models'
import generateFiles from '../src/generate/generateFiles'


const TEMP_DIR = path.join(process.cwd(), './.tmp')
console.log('TEMP_DIR', TEMP_DIR)

describe('Model Generation', () => {

  beforeAll(() => {
    rimraf.sync(TEMP_DIR)
    mkdirp.sync(TEMP_DIR)
  })

  it('creates model files from a list of models', async () => {
    const options = {
      models,
      root: TEMP_DIR,
    }
    await generateFiles(options)
  })
})
