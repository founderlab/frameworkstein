/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model } from '../../src/'
import Fabricator from '../../src/lib/Fabricator'
import SelfOwner from './m2mModels/SelfOwner'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const THROUGH_TABLE = 'through_table_name'

const schema = {
  name: 'Text',
  createdDate: 'DateTime',
  updatedDate: 'DateTime',
}

const BASE_COUNT = 5
const PICK_KEYS = ['id', 'name']

describe('ManyToMany', () => {
  let Reverse = null
  let Owner = null
  // let SelfOwner = null
  const createdModels = {}

  beforeEach(async () => {
    Reverse = createModel({
      url: `${DATABASE_URL}/reverses`,
      schema: _.defaults({}, schema, {
        owners() { return ['hasMany', Owner, {through: THROUGH_TABLE}] },
      }),
    })(class Reverse extends Model {})

    Owner = createModel({
      url: `${DATABASE_URL}/owners`,
      schema: _.defaults({}, schema, {
        reverses() { return ['hasMany', Reverse] },
      }),
    })(class Owner extends Model {})

    await Reverse.store.resetSchema({verbose: process.env.VERBOSE})
    await Owner.store.resetSchema({verbose: process.env.VERBOSE})
    await SelfOwner.store.resetSchema({verbose: process.env.VERBOSE})

    // make some models
    createdModels.reverses = await Fabricator.create(Reverse, 2*BASE_COUNT, {
      name: Fabricator.uniqueId('reverses_'),
      createdDate: Fabricator.date,
    })

    createdModels.owners = await Fabricator.create(Owner, BASE_COUNT, {
      name: Fabricator.uniqueId('owners_'),
      createdDate: Fabricator.date,
    })

    // link and save all
    for (const owner of createdModels.owners) {
      const JoinTable = Owner.joinTable('reverses')
      const entry = new JoinTable({owner_id: owner.id, reverse_id: createdModels.reverses.pop().id})
      await entry.save()
      const entry2 = new JoinTable({owner_id: owner.id, reverse_id: createdModels.reverses.pop().id})
      await entry2.save()
    }
  })

  afterAll(async () => {
    await Reverse.store.disconnect()
    await Owner.store.disconnect()
    await Owner.relation('reverses').joinTable.store.disconnect()
    await SelfOwner.store.disconnect()
    await SelfOwner.relation('parentOwners').joinTable.store.disconnect()
  })

  it('Can select a self relation with $include`', async () => {
    const childOwner = new SelfOwner()
    await childOwner.save()
    const parentOwner = new SelfOwner()
    await parentOwner.save()
    const parentOwner2 = new SelfOwner()
    await parentOwner2.save()

    await childOwner.link('parentOwners', parentOwner.id)
    await childOwner.link('parentOwners', parentOwner2.id)

    const childOwner2 = await SelfOwner.cursor({id: childOwner.id, $one: true}).select('id').include('parentOwners').toJSON()

    expect(childOwner2.parentOwners.length).toBe(2)
    expect(childOwner2.parentOwners[0].id).toBe(parentOwner.id)
    expect(childOwner2.parentOwners[1].id).toBe(parentOwner2.id)
  })

  it('Can add a m2m relation with `link` and remove with `unlink` with the same model', async () => {
    const childOwner = new SelfOwner()
    await childOwner.save()
    const parentOwner = new SelfOwner()
    await parentOwner.save()

    const linkData = {childOwner_id: childOwner.id, parentOwner_id: parentOwner.id}
    const link = await SelfOwner.link('parentOwners', linkData)

    expect(link).toBeTruthy()
    expect(link.data.childOwner_id).toBe(childOwner.id)
    expect(link.data.parentOwner_id).toBe(parentOwner.id)

    await SelfOwner.unlink('parentOwners', linkData)
    const JoinTableModel = SelfOwner.relation('parentOwners').joinTable
    const exists = await JoinTableModel.exists(linkData)
    expect(exists).toBeFalsy()
  })

  it('Can add a m2m relation with `Model.link` and remove with `Model.unlink`', async () => {
    const newOwner = new Owner()
    await newOwner.save()
    const newReverse = new Reverse()
    await newReverse.save()

    const linkData = {owner_id: newOwner.id, reverse_id: newReverse.id}
    const link = await Owner.link('reverses', linkData)

    expect(link).toBeTruthy()
    expect(link.data.owner_id).toBe(newOwner.id)
    expect(link.data.reverse_id).toBe(newReverse.id)

    await Owner.unlink('reverses', linkData)
    const JoinTableModel = Owner.relation('reverses').joinTable
    const exists = await JoinTableModel.exists(linkData)
    expect(exists).toBeFalsy()
  })

  it('Can add a m2m relation with `link` and remove with `unlink`', async () => {
    const newOwner = new Owner()
    await newOwner.save()
    const newReverse = new Reverse()
    await newReverse.save()

    const link = await newOwner.link('reverses', newReverse)

    expect(link).toBeTruthy()
    expect(link.data.owner_id).toBe(newOwner.id)
    expect(link.data.reverse_id).toBe(newReverse.id)

    await newOwner.unlink('reverses', newReverse.id)
    const JoinTableModel = Owner.relation('reverses').joinTable
    const exists = await JoinTableModel.exists({owner_id: newOwner.id, reverse_id: newReverse.id})
    expect(exists).toBeFalsy()
  })

  it('Can specify the join table name with `through`', async () => {
    const JoinTable = Owner.joinTable('reverses')
    expect(JoinTable.store.table).toBe(THROUGH_TABLE)
  })

  it('Can include related (two-way hasMany) models', async () => {
    const owner = await Owner.cursor({$one: true}).include('reverses').toJSON()
    expect(owner).toBeTruthy()
    expect(owner.reverses).toBeTruthy()
    expect(owner.reverses.length).toBe(2)
  })

  it('Can query on related (two-way hasMany) models', async () => {
    const reverse = await Reverse.findOne()
    expect(reverse).toBeTruthy()

    const json = await Owner.find({'reverses.name': reverse.data.name})
    const owner = json[0]

    expect(owner).toBeTruthy()
    expect(owner.id).toBeTruthy()

    const JoinTable = Owner.joinTable('reverses')
    const joins = await JoinTable.cursor({reverse_id: reverse.id}).toJSON()
    expect(_.find(joins, j => j.owner_id === owner.id)).toBeTruthy()
  })

  it('Can query on related (two-way hasMany) models with included relations', async () => {
    const reverse = await Reverse.findOne()
    expect(reverse).toBeTruthy()

    const json = await Owner.cursor({'reverses.name': reverse.data.name}).include('reverses').toJSON()
    const owner = json[0]

    expect(owner).toBeTruthy()
    expect(owner.reverses).toBeTruthy()
    expect(owner.reverses.length).toBe(2)

    const JoinTable = Owner.joinTable('reverses')
    for (const reverse of owner.reverses) {
      const joins = await JoinTable.cursor({reverse_id: reverse.id}).toJSON()
      expect(_.find(joins, j => j.owner_id === owner.id)).toBeTruthy()
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

    const res = await Reverse.destroy({'owners.name': owner.data.name})
    expect(res).toBe(2)

    const count = await Reverse.count({'owners.id': owner.id})
    expect(count).toBe(0)
  })
})
