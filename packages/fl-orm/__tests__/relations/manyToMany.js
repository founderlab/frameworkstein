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

describe('ManyToMany', () => {
  let Reverse = null
  let Owner = null
  const createdModels = {}

  beforeEach(async () => {
    Reverse = createModel({
      url: `${DATABASE_URL}/reverses`,
      schema: _.defaults({}, schema, {
        owners() { return ['hasMany', Owner] },
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

})
