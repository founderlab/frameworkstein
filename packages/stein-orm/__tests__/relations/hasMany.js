/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model } from '../../src/'
import Fabricator from '../../src/lib/Fabricator'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const schema = {
  name: 'Text',
  createdDate: 'DateTime',
  updatedDate: 'DateTime',
}

const BASE_COUNT = 5
const PICK_KEYS = ['id', 'name']

describe('HasMany', () => {
  let Flat = null
  let Reverse = null
  let ForeignReverse = null
  let Owner = null
  let createdModels = {}

  beforeEach(async () => {

    Flat = createModel({
      url: `${DATABASE_URL}/flats`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner] },
      }),
    })(class Flat extends Model {})

    Reverse = createModel({
      url: `${DATABASE_URL}/reverses`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner] },
        anotherOwner() { return ['belongsTo', Owner, {as: 'moreReverses'}] },
      }),
    })(class Reverse extends Model {})

    Owner = createModel({
      url: `${DATABASE_URL}/owners`,
      schema: _.defaults({}, schema, {
        flats() { return ['hasMany', Flat] },
        reverses() { return ['hasMany', Reverse] },
        moreReverses() { return ['hasMany', Reverse, {as: 'anotherOwner'}] },
      }),
    })(class Owner extends Model {})

    await Flat.store.resetSchema({verbose: process.env.VERBOSE})
    await Reverse.store.resetSchema({verbose: process.env.VERBOSE})
    await Owner.store.resetSchema({verbose: process.env.VERBOSE})

    // make some models
    createdModels.flats = await Fabricator.create(Flat, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
    })

    createdModels.reverses = await Fabricator.create(Reverse, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      createdDate: Fabricator.date,
    })

    createdModels.moreReverses = await Fabricator.create(Reverse, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      createdDate: Fabricator.date,
    })

    createdModels.owners = await Fabricator.create(Owner, BASE_COUNT, {
      name: Fabricator.uniqueId('owner_'),
      createdDate: Fabricator.date,
    })

    // link and save all
    for (const owner of createdModels.owners) {
      const [flat1, flat2] = [createdModels.flats.pop(), createdModels.flats.pop()]
      await flat1.save({owner_id: owner.id})
      await flat2.save({owner_id: owner.id})

      const [reverse1, reverse2] = [createdModels.reverses.pop(), createdModels.reverses.pop()]
      await reverse1.save({owner_id: owner.id})
      await reverse2.save({owner_id: owner.id})

      const [moreReverse1, moreReverse2] = [createdModels.moreReverses.pop(), createdModels.moreReverses.pop()]
      await moreReverse1.save({anotherOwner_id: owner.id})
      await moreReverse2.save({anotherOwner_id: owner.id})
    }
  })

  afterAll(async () => {
    await Flat.store.disconnect()
    await Reverse.store.disconnect()
    // await ForeignReverse.store.disconnect()
    await Owner.store.disconnect()
  })

  it('Can include related (one-way hasMany) models', async () => {
    const testModel = await Owner.cursor({$one: true}).include('flats').toJSON()
    expect(testModel).toBeTruthy()
    expect(testModel.flats).toBeTruthy()
    expect(testModel.flats.length).toBe(2)
  })

  it('Can include multiple related (one-way hasMany) models', async () => {
    const testModel = await Owner.cursor({$one: true}).include('flats', 'reverses').toJSON()

    expect(testModel).toBeTruthy()

    expect(testModel.flats).toBeTruthy()
    expect(testModel.reverses).toBeTruthy()
    expect(testModel.flats.length).toBe(2)
    expect(testModel.reverses.length).toBe(2)

    for (const flat of testModel.flats) {
      expect(testModel.id).toBe(flat.owner_id)
    }
    for (const reverse of testModel.reverses) {
      expect(testModel.id).toBe(reverse.owner_id)
    }
  })

  it('Can query on related (one-way hasMany) models', async () => {
    const reverse = await Reverse.findOne({owner_id: {$ne: null}})

    expect(reverse).toBeTruthy()
    const json = await Owner.find({'reverses.name': reverse.data.name})
    const testModel = json[0]

    expect(testModel).toBeTruthy()
    expect(testModel.id).toBe(reverse.data.owner_id)
  })

  it('Can query on related (one-way hasMany) models with included relations', async () => {
    const reverse = await Reverse.findOne({owner_id: {$ne: null}})

    expect(reverse).toBeTruthy()

    const json = await Owner.cursor({'reverses.name': reverse.data.name}).include('flats', 'reverses').toJSON()
    const testModel = json[0]

    expect(testModel).toBeTruthy()

    expect(testModel.flats).toBeTruthy()
    expect(testModel.reverses).toBeTruthy()

    expect(testModel.flats.length).toBe(2)
    expect(testModel.reverses.length).toBe(2)

    for (const flat of testModel.flats) {
      expect(testModel.id).toBe(flat.owner_id)
    }
    for (const reverse of testModel.reverses) {
      expect(testModel.id).toBe(reverse.owner_id)
    }
  })

  it('Should be able to count relationships', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const count = await Reverse.count({owner_id: owner.id})

    expect(count).toBe(2)
  })

  it('Should be able to count relationships with paging', async () => {
    const owner = await Owner.findOne()

    expect(owner).toBeTruthy()

    const pagingInfo = await Reverse.cursor({owner_id: owner.id, $page: true}).toJSON()

    expect(pagingInfo.offset).toBe(0)
    expect(pagingInfo.totalRows).toBe(2)
  })

  it('Handles a destroy query via a relations property', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const res = await Reverse.destroy({'owner.name': owner.data.name})
    expect(res).toBe(2)

    const count = await Reverse.count({owner_id: owner.id})
    expect(count).toBe(0)
  })

  it('can query on a related (hasOne) model spanning a relationship', async () => {
    const NAME = 'newname'
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})
    expect(reverse).toBeTruthy()
    await reverse.save({name: null})

    const flats = await Flat.find({'owner.reverses.name': reverse.data.name})
    expect(flats.length).toBeTruthy()

    for (const f of flats) {
      expect(f.data.owner_id).toBe(reverse.data.owner_id)
    }
  })

  it('can query on a related (hasOne) model spanning a relationship with $exists and $ne', async () => {
    const NAME = 'newname'
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})
    expect(reverse).toBeTruthy()
    await reverse.save({name: null})

    const flats = await Flat.find({'owner.reverses.name': {$exists: false}})
    expect(flats.length).toBeTruthy()

    for (const f of flats) {
      expect(f.data.owner_id).toBe(reverse.data.owner_id)
    }

    const namedFlats = await Flat.find({'owner.reverses.name': {$ne: null}})
    for (const flat of flats) {
      expect(_.find(namedFlats, f => f.id === flat.id)).toBeFalsy
    }
  })

})
