/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model } from '../../src/'
import Fabricator from '../../src/lib/Fabricator'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  url: `${DATABASE_URL}/flats`,
  schema: {
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
  },
}


const BASE_COUNT = 10

describe('Class methods', () => {
  let Flat = null

  beforeEach(async () => {
    Flat = createModel(options)(class Flat extends Model {})
    await Flat.store.resetSchema({verbose: process.env.VERBOSE})

    return Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
      updatedDate: Fabricator.date,
    })
  })

  afterAll(() => Flat.store.disconnect())

  it('counts by query', async () => {
    let count = await Flat.count({})
    expect(count).toBe(BASE_COUNT)

    const bob = new Flat({name: 'Bob'})
    await bob.save()

    count = await Flat.count({name: 'Bob'})
    expect(count).toBe(1)

    count = await Flat.count({name: 'Fred'})
    expect(count).toBe(0)

    count = await Flat.count({})
    expect(count).toBe(BASE_COUNT+1)
  })

  it('exists by query', async () => {
    let res = await Flat.exists({})
    expect(res).toBeTruthy()

    const bob = new Flat({name: 'Bob'})
    await bob.save()

    res = await Flat.exists({name: 'Bob'})
    expect(res).toBeTruthy()

    res = await Flat.exists({name: 'Fred'})
    expect(res).toBeFalsy()
  })

  it('destroys by query', async () => {
    let count = await Flat.count({})
    expect(count).toBe(BASE_COUNT)

    const bob = new Flat({name: 'Bob'})
    await bob.save()

    let res = await Flat.destroy({name: 'Bob'})
    expect(res).toBe(1)

    count = await Flat.count({})
    expect(count).toBe(BASE_COUNT)

    const b2 = new Flat({name: 'Bob'})
    await b2.save()
    const id = b2.id

    res = await Flat.destroy(b2.id)
    expect(res).toBe(1)

    count = await Flat.count({})
    expect(count).toBe(BASE_COUNT)
  })

  it('destroys by complex query', async () => {
    let count = await Flat.count({})
    expect(count).toBe(BASE_COUNT)

    const bob = new Flat({name: 'Bob'})
    await bob.save()

    let res = await Flat.destroy({name: {$ne: 'Bob'}})
    expect(res).toBe(BASE_COUNT)
  })

  it('does not allow unsafe destroys', async () => {
    expect.assertions(2)

    try {
      await Flat.destroy()
    }
    catch (err) {
      expect(err).toBeTruthy()
    }

    try {
      await Flat.destroy({})
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
  })

})

