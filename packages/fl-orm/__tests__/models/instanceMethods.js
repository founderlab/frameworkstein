import _ from 'lodash'
import { createModel, Model } from '../../src/'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  url: `${DATABASE_URL}/flats`,
  schema: {
    boolean: 'Boolean',
    name: 'Text',
  },
}


describe('DB', () => {
  let Flat = null

  beforeEach(() => {
    Flat = createModel(options)(class Flat extends Model {})
    return Flat.store.resetSchema({verbose: process.env.VERBOSE})
  })

  afterAll(() => Flat.store.disconnect())

  it('Can save a new model', async () => {
    const model = new Flat({boolean: true})
    const result = await model.save()
    expect(result.data.id).toBe('1')
    expect(result.data.boolean).toBe(true)

    const model2 = new Flat()
    const result2 = await model2.save({name: 'yep'})
    expect(result2.data.id).toBe('2')
    expect(result2.data.name).toBe('yep')
  })

  it('saves a model and assigns an id', async () => {
    const bob = new Flat({name: 'Bob'})
    expect(bob.data.name).toBe('Bob')
    expect(bob.id).toBeFalsy()

    await bob.save()
    expect(bob.data.name).toBe('Bob')
    expect(bob.id).toBeTruthy()
  })

  it('destroys a model', async () => {
    const bob = new Flat({name: 'Bob'})
    await bob.save()

    const model = await Flat.findOne()
    expect(model).toBeTruthy()
    const model_id = model.id
    await model.destroy()
    const model2 = await Flat.find(model_id)
    expect(model2).toBeFalsy()
  })
})
