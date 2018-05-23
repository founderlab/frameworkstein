import { createModel, Model } from 'stein-orm'
import SqlStore from '../../src'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  url: `${DATABASE_URL}/flats`,
  schema: {
    boolean: 'Boolean',
  },
  Store: SqlStore,
}


describe('DB', () => {
  let Flat = null

  afterAll(() => Flat.store.disconnect())

  it('can reset schema', () => {
    Flat = createModel(options)(class Flat extends Model {})
    return Flat.store.resetSchema({verbose: process.env.VERBOSE})
  })

})
