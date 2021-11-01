/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model, Utils } from 'stein-orm'
import Fabricator from '../../src/Fabricator'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const schema = {
  name: 'Text',
  tenPlus: 'Integer',
  tenMinus: 'Integer',
  createdDate: 'DateTime',
  updatedDate: 'DateTime',
}

const BASE_COUNT = 5

describe('HasMany', () => {
  let Single = null
  let Double = null
  let Owner = null
  let Parent = null
  let createdModels = {}

  beforeEach(async () => {

    Single = createModel({
      Store: require('stein-orm-sql'),
      url: `${DATABASE_URL}/singles`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner] },
      }),
    })(class Single extends Model {})

    Double = createModel({
      Store: require('stein-orm-sql'),
      url: `${DATABASE_URL}/doubles`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner] },
        anotherOwner() { return ['belongsTo', Owner, {as: 'moreDoubles'}] },
      }),
    })(class Double extends Model {})

    Owner = createModel({
      Store: require('stein-orm-sql'),
      url: `${DATABASE_URL}/owners`,
      schema: _.defaults({}, schema, {
        singles() { return ['hasMany', Single] },
        doubles() { return ['hasMany', Double] },
        moreDoubles() { return ['hasMany', Double, {as: 'anotherOwner'}] },
        parent() { return ['belongsTo', Parent] },
      }),
    })(class Owner extends Model {})

    Parent = createModel({
      Store: require('stein-orm-sql'),
      url: `${DATABASE_URL}/parents`,
      schema: _.defaults({}, schema, {
        owners() { return ['hasMany', Owner] },
      }),
    })(class Parent extends Model {})

    await Single.store.resetSchema({verbose: process.env.VERBOSE})
    await Double.store.resetSchema({verbose: process.env.VERBOSE})
    await Owner.store.resetSchema({verbose: process.env.VERBOSE})
    await Parent.store.resetSchema({verbose: process.env.VERBOSE})

    // make some models
    createdModels.singles = await Fabricator.create(Single, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('single_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.doubles = await Fabricator.create(Double, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('double_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.moreDoubles = await Fabricator.create(Double, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('double_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.owners = await Fabricator.create(Owner, BASE_COUNT, {
      name: Fabricator.uniqueId('owner_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.parents = await Fabricator.create(Parent, BASE_COUNT, {
      name: Fabricator.uniqueId('owner_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    // link and save all
    for (const owner of createdModels.owners) {
      const [single1, single2] = [createdModels.singles.pop(), createdModels.singles.pop()]
      await single1.save({owner_id: owner.id})
      await single2.save({owner_id: owner.id})

      const [double1, double2] = [createdModels.doubles.pop(), createdModels.doubles.pop()]
      await double1.save({owner_id: owner.id})
      await double2.save({owner_id: owner.id})

      const [moreDouble1, moreDouble2] = [createdModels.moreDoubles.pop(), createdModels.moreDoubles.pop()]
      await moreDouble1.save({anotherOwner_id: owner.id})
      await moreDouble2.save({anotherOwner_id: owner.id})

      const parent = createdModels.parents.pop()
      await owner.save({parent_id: parent.id})
    }
  })

  afterAll(async () => {
    await Single.store.disconnect()
    await Double.store.disconnect()
    await Owner.store.disconnect()
    await Parent.store.disconnect()
  })

  it('Ignores $include with $count', async () => {
    const countQuery = {
      $count: true,
    }
    const count = await Owner.cursor(countQuery).toJSON()

    const countIncludeQuery = {
      $count: true,
      $include: 'singles',
    }
    const countWithInclude = await Owner.cursor(countIncludeQuery).toJSON()

    expect(count).toBe(countWithInclude)
  })

  it('Can nest a related query (hasMany -> belongsTo)', async () => {
    const singleQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const single = await Single.cursor({...singleQuery, $one: true}).toJSON()

    const owner = await Owner.cursor({
      singles: singleQuery,
      $one: true,
      $include: 'singles',
    }).toJSON()

    expect(owner).toBeTruthy()
    expect(owner.id).toBe(single.owner_id)
  })

  it('Can nest a related query (belongsTo -> hasMany)', async () => {
    const ownerQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const owner = await Owner.cursor({...ownerQuery, $one: true}).toJSON()

    const single = await Single.cursor({
      owner: ownerQuery,
      $one: true,
      $include: 'owner',
    }).toJSON()

    expect(owner).toBeTruthy()
    expect(owner.id).toBe(single.owner_id)
  })

  it('Can nest a related query (belongsTo -> hasMany -> belongsTo)', async () => {
    const singleQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const single = await Single.cursor({...singleQuery, $one: true}).toJSON()

    const double = await Double.cursor({
      'owner.singles': singleQuery,
      $one: true,
    }).toJSON()

    expect(double).toBeTruthy()
    expect(double.owner_id).toBe(single.owner_id)
  })

  it('Can nest a related query (belongsTo -> hasMany -> hasMany)', async () => {
    const parentQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const parent = await Parent.cursor({...parentQuery, $one: true}).toJSON()

    const double = await Double.cursor({
      'owner.parent': parentQuery,
      $one: true,
    }).toJSON()

    expect(double).toBeTruthy()

    const doubleOwner = await Owner.cursor({
      id: double.owner_id,
      $one: true,
    }).toJSON()

    expect(doubleOwner.parent_id).toBe(parent.id)
  })

  it('Can include related (one-way hasMany) models', async () => {
    const testModel = await Owner.cursor({$one: true}).include('singles').toJSON()
    expect(testModel).toBeTruthy()
    expect(testModel.singles).toBeTruthy()
    expect(testModel.singles.length).toBe(2)
  })

  it('Can include multiple related (one-way hasMany) models', async () => {
    const testModel = await Owner.cursor({$one: true}).include('singles', 'doubles').toJSON()

    expect(testModel).toBeTruthy()

    expect(testModel.singles).toBeTruthy()
    expect(testModel.doubles).toBeTruthy()
    expect(testModel.singles.length).toBe(2)
    expect(testModel.doubles.length).toBe(2)

    for (const single of testModel.singles) {
      expect(testModel.id).toBe(single.owner_id)
    }
    for (const double of testModel.doubles) {
      expect(testModel.id).toBe(double.owner_id)
    }
  })

  it('Can query on related (one-way hasMany) models', async () => {
    const double = await Double.findOne({owner_id: {$ne: null}})

    expect(double).toBeTruthy()
    const json = await Owner.find({'doubles.name': double.data.name})
    const testModel = json[0]

    expect(testModel).toBeTruthy()
    expect(testModel.id).toBe(double.data.owner_id)
  })

  it('Can query on related (one-way hasMany) models with $ne', async () => {
    const double = await Double.findOne({owner_id: {$ne: null}})

    expect(double).toBeTruthy()
    const json = await Owner.find({'doubles.name': {$ne: 'John'}})
    const testModel = json[0]

    expect(testModel).toBeTruthy()
    expect(testModel.id).toBe(double.data.owner_id)
  })

  it('Can query on related (one-way hasMany) models with included relations', async () => {
    const double = await Double.findOne({owner_id: {$ne: null}})

    expect(double).toBeTruthy()

    const json = await Owner.cursor({'doubles.name': double.data.name}).include('singles', 'doubles').toJSON()
    const testModel = json[0]

    expect(testModel).toBeTruthy()

    expect(testModel.singles).toBeTruthy()
    expect(testModel.doubles).toBeTruthy()

    expect(testModel.singles.length).toBe(2)
    expect(testModel.doubles.length).toBe(2)

    for (const single of testModel.singles) {
      expect(testModel.id).toBe(single.owner_id)
    }
    for (const double of testModel.doubles) {
      expect(testModel.id).toBe(double.owner_id)
    }
  })

  it('Should be able to count relationships', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const count = await Double.count({owner_id: owner.id})

    expect(count).toBe(2)
  })

  it('Should be able to count relationships with paging', async () => {
    const owner = await Owner.findOne()

    expect(owner).toBeTruthy()

    const pagingInfo = await Double.cursor({owner_id: owner.id, $page: true}).toJSON()

    expect(pagingInfo.offset).toBe(0)
    expect(pagingInfo.totalRows).toBe(2)
  })

  it('Handles a destroy query via a relations property', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const res = await Double.destroy({'owner.name': owner.data.name})
    expect(res).toBe(2)

    const count = await Double.count({owner_id: owner.id})
    expect(count).toBe(0)
  })

  it('can query on a related (hasOne) model spanning a relationship', async () => {
    const NAME = 'newname'
    const double = await Double.findOne({owner_id: {$exists: true}})
    expect(double).toBeTruthy()
    await double.save({name: null})

    const singles = await Single.find({'owner.doubles.name': double.data.name})
    expect(singles.length).toBeTruthy()

    for (const f of singles) {
      expect(f.data.owner_id).toBe(double.data.owner_id)
    }
  })

  it('can query on a related (hasOne) model spanning a relationship with $exists and $ne', async () => {
    const NAME = 'newname'
    const double = await Double.findOne({owner_id: {$exists: true}})
    expect(double).toBeTruthy()
    await double.save({name: null})

    const singles = await Single.find({'owner.doubles.name': {$exists: false}})
    expect(singles.length).toBeTruthy()

    for (const f of singles) {
      expect(f.data.owner_id).toBe(double.data.owner_id)
    }

    const namedSingles = await Single.find({'owner.doubles.name': {$ne: null}})
    for (const single of singles) {
      expect(_.find(namedSingles, f => f.id === single.id)).toBeFalsy
    }
  })

  it('Can sort on a related field (belongsTo -> hasMany)', async () => {
    const singles = await Single.find({$sort: 'owner.name'})
    const singlesInc = await Single.find({$sort: 'owner.name', $include: 'owner'})
    const owners = _.map(singlesInc, f => f.data.owner)
    expect(Utils.isSorted(owners, ['name'])).toBeTruthy()

    // ensure same sort when using $include
    for (const owner of owners) {
      expect(owner.id).toEqual(singles.shift().data.owner_id)
    }

    const singlesInc2 = await Single.find({$sort: '-owner.name', $include: 'owner'})
    const owners2 = _.map(singlesInc2, f => f.data.owner)
    expect(Utils.isSorted(owners2, ['-name'])).toBeTruthy()
  })

  it('Can sort on a related field (belongsTo -> hasMany) with a nested related query', async () => {
    const single = await Single.findOne()
    const doubles = await Double.find({'anotherOwner.singles': {name: single.data.name}, $sort: ['owner.name']})
    expect(doubles).toBeTruthy()
  })

})
