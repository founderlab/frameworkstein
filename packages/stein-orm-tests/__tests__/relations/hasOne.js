/* eslint-disable
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model } from 'stein-orm'
import Fabricator from '../../src/Fabricator'
import Flat from '../../src/hasOneModels/Flat'
import Reverse from '../../src/hasOneModels/Reverse'
import ForeignReverse from '../../src/hasOneModels/ForeignReverse'
import Owner from '../../src/hasOneModels/Owner'


const BASE_COUNT = 5

describe('HasOne', () => {
  const createdModels = {}

  beforeEach(async () => {

    await Flat.store.resetSchema({verbose: process.env.VERBOSE})
    await Reverse.store.resetSchema({verbose: process.env.VERBOSE})
    await ForeignReverse.store.resetSchema({verbose: process.env.VERBOSE})
    await Owner.store.resetSchema({verbose: process.env.VERBOSE})

    // make some models
    createdModels.flats = await Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.reverses = await Fabricator.create(Reverse, BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.moreReverses = await Fabricator.create(Reverse, BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      tenPlus: Fabricator.increment(10),
      tenMinus: Fabricator.decrement(10),
      createdDate: Fabricator.date,
    })

    createdModels.foreignReverses = await Fabricator.create(ForeignReverse, BASE_COUNT, {
      name: Fabricator.uniqueId('foreignReverse_'),
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

    // link and save all
    for (const owner of createdModels.owners) {
      const flat = createdModels.flats.pop()
      await owner.save({flat_id: flat.id})

      const reverse = createdModels.reverses.pop()
      await reverse.save({owner_id: owner.id})

      const reverse2 = createdModels.moreReverses.pop()
      await reverse2.save({ownerAs_id: owner.id})

      const foreignReverse = createdModels.foreignReverses.pop()
      await foreignReverse.save({owner_id: owner.id})
    }
  })

  afterAll(async () => {
    await Flat.store.disconnect()
    await Reverse.store.disconnect()
    await ForeignReverse.store.disconnect()
    await Owner.store.disconnect()
  })


  it('can create a model and load a related model by id (belongsTo)', async () => {
    const flat = await Flat.findOne()
    expect(flat).toBeTruthy()

    const flat_id = flat.id
    const owner = new Owner({flat_id})
    await owner.save()

    const o2 = await Owner.findOne({flat_id})
    expect(o2).toBeTruthy()
    expect(o2.data.flat_id).toBe(flat_id)
    expect(_.size(o2.data)).toBe(7)
  })

  it('can create a model and load a related model by id $in (belongsTo)', async () => {
    const flat = await Flat.findOne()
    expect(flat).toBeTruthy()

    const flat_id = flat.id
    const owner = new Owner({flat_id})
    await owner.save()

    const o2 = await Owner.findOne({flat_id: {$in: [flat_id]}})
    expect(o2).toBeTruthy()
    expect(o2.data.flat_id).toBe(flat_id)
  })

  it('Has an id column for a belongsTo and not for a hasOne relation', async () => {
    const owner = await Owner.findOne()

    expect(owner).toBeTruthy()
    expect(owner.data.flat_id).toBeTruthy()
    expect(owner.data.reverse_id).toBeFalsy()
    const r = await Reverse.findOne({owner_id: owner.id})
    expect(r).toBeTruthy()
    expect(r.data.owner_id).toBe(owner.id)
  })

  it('Can nest a related query (belongsTo -> hasOne)', async () => {
    const frQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const flat = await Flat.cursor({...frQuery, $one: true}).toJSON()

    const owner = await Owner.cursor({
      flat: frQuery,
      $one: true,
      $include: 'flat',
    }).toJSON()

    expect(flat).toBeTruthy()
    expect(owner.flat_id).toBe(flat.id)
  })

  it('Can nest a related query (hasOne -> belongsTo)', async () => {
    const ownerQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const owner = await Owner.cursor({...ownerQuery, $one: true}).toJSON()

    const flat = await Flat.cursor({
      owner: ownerQuery,
      $one: true,
      $include: 'owner',
    }).toJSON()

    expect(flat).toBeTruthy()
    expect(owner.flat_id).toBe(flat.id)
  })

  it('Can nest a related query (belongsTo -> hasOne -> hasOne)', async () => {
    const frQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const fr = await ForeignReverse.cursor({...frQuery, $one: true}).toJSON()

    const reverse = await Reverse.cursor({
      'owner.foreignReverse': frQuery,
      $verbose: true,
      $one: true,
    }).toJSON()

    expect(reverse).toBeTruthy()
    expect(reverse.owner_id).toBe(fr.ownerish_id)
  })

  it('Can nest a related query (belongsTo -> hasOne -> belongsTo)', async () => {
    const flatQuery = {
      tenPlus: 10,
      tenMinus: 10,
    }
    const flat = await Flat.cursor({...flatQuery, $one: true}).toJSON()

    const reverse = await Reverse.cursor({
      'owner.flat': flatQuery,
      $verbose: true,
      $one: true,
    }).toJSON()

    expect(reverse).toBeTruthy()

    const reverseOwner = await Owner.cursor({
      id: reverse.owner_id,
      $one: true,
    }).toJSON()

    expect(reverseOwner.id).toBe(reverse.owner_id)
  })

  it('can include a related (belongsTo) model', async () => {
    const owner = await Owner.cursor({$one: true}).include('flat').toJSON()
    expect(owner).toBeTruthy()
    expect(owner.flat).toBeTruthy()
    expect(owner.flat.id).toBeTruthy()

    expect(owner.flat_id).toBe(owner.flat.id)
  })

  it('can include a related (hasOne) model', async () => {
    const owner = await Owner.cursor({$one: true}).include('reverse').toJSON()

    expect(owner).toBeTruthy()
    expect(owner.reverse).toBeTruthy()
    expect(owner.reverse.id).toBeTruthy()
    expect(owner.id).toBe(owner.reverse.owner_id)
  })

  it('can include multiple related models', async () => {
    const owner = await Owner.cursor({$one: true}).include('reverse', 'flat').toJSON()

    expect(owner).toBeTruthy()
    expect(owner.reverse).toBeTruthy()
    expect(owner.reverse.id).toBeTruthy()
    expect(owner.flat).toBeTruthy()
    expect(owner.flat.id).toBeTruthy()

    expect(owner.flat_id).toBe(owner.flat.id)
    expect(owner.id).toBe(owner.reverse.owner_id)
  })

  it('can query on a related (belongsTo) model property', async () => {
    const flat = await Flat.findOne()
    expect(flat).toBeTruthy()

    const owner = await Owner.findOne({$one: true, 'flat.id': flat.id})
    expect(owner).toBeTruthy()
    expect(flat.id).toBe(owner.data.flat_id)
  })

  it('can query on a related (belongsTo) model property when the relation is included', async () => {
    const flat = await Flat.findOne()

    expect(flat).toBeTruthy()
    const owner = await Owner.cursor({$one: true, 'flat.name': flat.data.name}).include('flat').toJSON()

    expect(owner).toBeTruthy()
    expect(owner.flat).toBeTruthy()
    expect(owner.flat.id).toBeTruthy()
    expect(flat.id).toBe(owner.flat.id)
    expect(flat.data.name).toBe(owner.flat.name)
  })

  it('can query on a related (hasOne) model', async () => {
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})
    expect(reverse).toBeTruthy()
    const owner = await Owner.find({$one: true, 'reverse.name': reverse.data.name})

    expect(owner).toBeTruthy()

    expect(reverse.data.owner_id).toBe(owner.id)
  })

  it('can query on a related (hasOne) model property when the relation is included', async () => {
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})

    expect(reverse).toBeTruthy()
    const owners = await Owner.cursor({'reverse.name': reverse.data.name}).include('reverse').toJSON()

    expect(owners).toBeTruthy()
    expect(owners.length).toBe(1)
    const owner = owners[0]
    expect(owner.reverse).toBeTruthy()
    expect(owner.reverse.id).toBeTruthy()

    expect(reverse.data.owner_id).toBe(owner.id)
    expect(reverse.data.name).toBe(owner.reverse.name)
  })

  it('Should be able to count relationships', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()
    const count = await Reverse.count({owner_id: owner.id})
    expect(count).toBe(1)
  })

  it('Should be able to count relationships with paging', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()
    const pagingInfo = await Reverse.find({owner_id: owner.id, $page: true})
    expect(pagingInfo.offset).toBe(0)
    expect(pagingInfo.totalRows).toBe(1)
  })

  it('Handles a get query for a hasOne and belongsTo two sided relation as "as" fields', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const reverse = await Reverse.findOne({ownerAs_id: owner.id})

    expect(reverse).toBeTruthy()
    expect(reverse.data.ownerAs_id).toBe(owner.id)
    expect(reverse.toJSON().ownerAs_id).toBe(owner.id)
    expect(!owner.toJSON().reverseAs_id).toBeTruthy()

    const ownerAs = await Owner.findOne({'reverseAs.id': reverse.id})

    expect(ownerAs).toBeTruthy()
    expect(ownerAs.id).toBe(reverse.toJSON().ownerAs_id)
    expect(ownerAs.id).toBe(owner.id)
  })

  it('Handles a destroy query via a relations property', async () => {
    const owner = await Owner.findOne()
    expect(owner).toBeTruthy()

    const res = await Reverse.destroy({'owner.name': owner.data.name})
    expect(res).toBe(1)

    const count = await Reverse.count({owner_id: owner.id})
    expect(count).toBe(0)
  })

  it('Handles setting a belongsTo relation by value', async () => {
    const owner = await Owner.findOne()
    const flat = await Flat.findOne({id: {$ne: owner.data.flat_id}})
    expect(owner.data.flat_id).not.toBe(flat.id)

    owner.set({flat})
    expect(owner.data.flat_id).toBe(flat.id)
  })

  it('Handles saving a belongsTo relation by value', async () => {
    const owner = await Owner.findOne()
    const flat = await Flat.findOne({id: {$ne: owner.data.flat_id}})
    expect(owner.data.flat_id).not.toBe(flat.id)

    await owner.save({flat})
    expect(owner.data.flat_id).toBe(flat.id)
  })

  it('can query on a related (hasOne) model spanning a relationship', async () => {
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})
    expect(reverse).toBeTruthy()

    const flat = await Flat.find({$one: true, 'owner.reverse.name': reverse.data.name})
    expect(flat).toBeTruthy()

    expect(flat.data.owner_id).toBe(reverse.owner_id)
  })

  it('can query on a related (hasOne) model spanning a relationship with $exists and $ne', async () => {
    const NAME = 'newname'
    const reverse = await Reverse.findOne({owner_id: {$exists: true}})
    expect(reverse).toBeTruthy()
    await reverse.save({name: null})

    const flat = await Flat.find({$one: true, 'owner.reverse.name': {$exists: false}})
    expect(flat).toBeTruthy()

    const owner = await Owner.find({$one: true, flat_id: flat.id})
    expect(owner).toBeTruthy()
    expect(owner.id).toBe(reverse.data.owner_id)

    const namedFlats = await Flat.find({'owner.reverse.name': {$ne: null}})
    expect(_.find(namedFlats, f => f.id === flat.id)).toBeFalsy()
  })

})
