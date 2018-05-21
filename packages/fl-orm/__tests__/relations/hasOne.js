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

describe('HasOne', () => {
  let Flat = null
  let Reverse = null
  let ForeignReverse = null
  let Owner = null
  const createdModels = {}

  beforeEach(async () => {
    Flat = createModel({
      url: `${DATABASE_URL}/flats`,
      schema: _.defaults({}, schema, {
        owner() { return ['hasOne', Owner] },
      }),
    })(class Flat extends Model {})

    Reverse = createModel({
      url: `${DATABASE_URL}/reverses`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner] },
        ownerAs() { return ['belongsTo', Owner, {as: 'reverseAs'}] },
      }),
    })(class Reverse extends Model {})

    ForeignReverse = createModel({
      url: `${DATABASE_URL}/one_foreign_reverses`,
      schema: _.defaults({}, schema, {
        owner() { return ['belongsTo', Owner, {foreignKey: 'ownerish_id'}] },
      }),
    })(class ForeignReverse extends Model {})

    Owner = createModel({
      url: `${DATABASE_URL}/owners`,
      schema: _.defaults({}, schema, {
        flat() { return ['belongsTo', Flat] },
        reverse() { return ['hasOne', Reverse] },
        reverseAs() { return ['hasOne', Reverse, {as: 'ownerAs'}] },
        foreignReverse() { return ['hasOne', ForeignReverse] },
      }),
    })(class Owner extends Model {})

    await Flat.store.resetSchema({verbose: process.env.VERBOSE})
    await Reverse.store.resetSchema({verbose: process.env.VERBOSE})
    await ForeignReverse.store.resetSchema({verbose: process.env.VERBOSE})
    await Owner.store.resetSchema({verbose: process.env.VERBOSE})

    // make some models
    createdModels.flats = await Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
    })

    createdModels.reverses = await Fabricator.create(Reverse, BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      createdDate: Fabricator.date,
    })

    createdModels.moreReverses = await Fabricator.create(Reverse, BASE_COUNT, {
      name: Fabricator.uniqueId('reverse_'),
      createdDate: Fabricator.date,
    })

    createdModels.foreignReverses = await Fabricator.create(ForeignReverse, BASE_COUNT, {
      name: Fabricator.uniqueId('foreignReverse_'),
      createdDate: Fabricator.date,
    })

    createdModels.owners = await Fabricator.create(Owner, BASE_COUNT, {
      name: Fabricator.uniqueId('owner_'),
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
    expect(_.size(o2.data)).toBe(5)
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
    const reverse = await Reverse.findOne()
    expect(reverse).toBeTruthy()
    const owner = await Owner.find({$one: true, 'reverse.name': reverse.data.name})

    expect(owner).toBeTruthy()

    expect(reverse.data.owner_id).toBe(owner.id)
  })

  it('can query on a related (hasOne) model property when the relation is included', async () => {
    const reverse = await Reverse.findOne()

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

  // it('Appends json for a related model', async () => {
  //   const owner = await Owner.findOne()

  //   expect(owner).toBeTruthy()

  //   let relatedJson = await JSONUtils.renderRelated(owner, 'reverse', ['id', 'createdDate'])

  //   expect(relatedJson.id).toBeTruthy()
  //   expect(relatedJson.createdDate).toBeTruthy()
  //   expect(!relatedJson.updatedDate).toBeTruthy()

  //   relatedJson = await JSONUtils.renderRelated(owner, 'flat', ['id', 'createdDate'])

  //   expect(relatedJson.id).toBeTruthy()
  //   expect(relatedJson.createdDate).toBeTruthy()
  //   expect(!relatedJson.updatedDate).toBeTruthy()
  // })

})











// owner.save {flat: null}, (err) ->
//

//   BackboneORM.model_cache.reset() # reset cache
//   Owner.find owner.id, (err, loaded_owner) ->
//
//     expect(loaded_owner.data.flat.id).toBe(flat_id)
//     done()






  // it('can fetch and serialize a custom foreign key', async () => {
  //   const testModel = await Owner.findOne()
  //   expect(testModel).toBeTruthy()

  //   const relatedModel = await testModel.get('foreignReverse')
  //   expect(relatedModel).toBeTruthy()

  //   const relatedJson = relatedModel.toJSON()
  //   expect(testModel.id).toBe(relatedJson.ownerish_id)
  // })



    // it('can create a model and update the relationship (belongsTo)', async () => {
    //   const relatedKey = 'flat'
    //   const relatedIdAccessor = 'flat_id'

    //   return Owner.cursor().include(relatedKey).toModel((err, owner) => {
    //     let attributes

    //     expect(owner).toBeTruthy()
    //     const owner_id = owner.id
    //     const related = owner.get(relatedKey)
    //     const related_id = related.id
    //     expect(related).toBeTruthy()

    //     (attributes = {})[relatedKey] = related
    //     const newOwner = new Owner(attributes)
    //     let owner1 = null; let newOwner1 = null; let newOwner_id = null

    //     expect(related).toBe(owner.get(relatedKey))
    //     expect(related_id).toBe(owner.get(relatedIdAccessor))
    //     expect(related).toBe(newOwner.get(relatedKey))
    //     expect(related_id).toBe(newOwner.get(relatedIdAccessor))

    //     const queue = new Queue(1)
    //     queue.defer(callback => newOwner.save(callback))
    //     queue.defer(callback => owner.save(callback))

    //     // make sure nothing changed after save
    //     queue.defer((callback) => {
    //       newOwner_id = newOwner.id
    //       expect(newOwner_id).toBeTruthy()

    //       expect(related).toBe(owner.get(relatedKey))
    //       expect(related_id).toBe(owner.get(relatedIdAccessor))
    //       expect(related).toBe(newOwner.get(relatedKey))
    //       expect(related_id).toBe(newOwner.get(relatedIdAccessor))
    //       return callback()
    //     })

    //     // load
    //     queue.defer(callback => const _owner) => callback(err, (owner1 = _owner))) = await Owner.find(owner_id)
    //     queue.defer(callback => const _owner) => callback(err, (newOwner1 = _owner))) = await Owner.find(newOwner_id)

    //     // check
    //     queue.defer((callback) => {
    //       expect(related_id).toBe(owner1.get(relatedIdAccessor))
    //       expect(related_id).toBe(newOwner1.get(relatedIdAccessor))

    //       return owner1.get(relatedKey, (err, related) => {

    //         expect(related_id).toBe(related.id)

    //         return newOwner1.get(relatedKey, (err, related) => {

    //           expect(related_id).toBe(related.id)
    //           return callback()
    //         })
    //       })
    //     })

    //     return queue.await(done)
    //   })
    // })

    // it('can create a model and update the relationship (hasOne)', async () => {
    //   // TODO: implement embedded set - should clone in set or the caller needed to clone? (problem is sharing an in memory instance)
    //   if (options.embed) {  }

    //   const relatedKey = 'reverse'
    //   const relatedIdAccessor = 'reverse_id'

    //   return Owner.cursor().include(relatedKey).toModel((err, owner) => {
    //     let attributes

    //     expect(owner).toBeTruthy()
    //     const related = owner.get(relatedKey)
    //     const owner_id = owner.id
    //     const related_id = related.id
    //     expect(related).toBeTruthy()

    //     (attributes = {})[relatedKey] = related
    //     const newOwner = new Owner(attributes)
    //     let owner1 = null; let newOwner1 = null; let newOwner_id = null

    //     expect(null).toBe(owner.get(relatedKey))
    //     expect(null).toBe(owner.get(relatedIdAccessor))
    //     expect(related).toBe(newOwner.get(relatedKey))
    //     expect(related_id).toBe(newOwner.get(relatedIdAccessor))

    //     const queue = new Queue(1)
    //     queue.defer(callback => newOwner.save(callback))
    //     queue.defer(callback => owner.save(callback))

    //     // make sure nothing changed after save
    //     queue.defer((callback) => {
    //       newOwner_id = newOwner.id
    //       expect(newOwner_id).toBeTruthy()

    //       expect(null).toBe(owner.get(relatedKey))
    //       expect(null).toBe(owner.get(relatedIdAccessor))
    //       expect(related).toBe(newOwner.get(relatedKey))
    //       expect(related_id).toBe(newOwner.get(relatedIdAccessor))
    //       return callback()
    //     })

    //     // load
    //     queue.defer(callback => const _owner) => callback(err, (owner1 = _owner))) = await Owner.find(owner_id)
    //     queue.defer(callback => const _owner) => callback(err, (newOwner1 = _owner))) = await Owner.find(newOwner_id)

    //     // check
    //     queue.defer(callback =>
    //       owner1.get(relatedKey, (err, related) => {

    //         expect(null).toBe(related)
    //         expect(null).toBe(owner1.get(relatedIdAccessor))

    //         return newOwner1.get(relatedKey, (err, related) => {

    //           expect(related_id).toBe(related.id)
    //           expect(related_id).toBe(newOwner1.get(relatedIdAccessor))
    //           return callback()
    //         })
    //       }),
    //     })

    //     return queue.await(done)
    //   })
    // })











    // // TODO: should the related model be loaded to save?
    // it.skip('can create a related model by id (hasOne)', async () => {
    //   const testModel = await Reverse.findOne()

    //     expect(testModel).toBeTruthy()

    //     const reverse_id = testModel.id
    //     const newModel = new Owner()
    //     return newModel.save((err) => {

    //       newModel.set({reverse_id})
    //       return newModel.save((err) => {


    //         return newModel.get('reverse', (err, reverse) => {

    //           expect(reverse).toBeTruthy()
    //           expect(reverse_id).toBe(reverse.id)

    //         })
    //       })
    //     })
    //   }),
    // })

    // it('Handles a get query for a belongsTo relation', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()

    //     return testModel.get('flat', (err, flat) => {

    //       expect(flat).toBeTruthy()
    //       if (testModel.relationIsEmbedded('flat')) {
    //         assert.deepEqual(testModel.toJSON().flat, flat.toJSON(), `Serialized embed. Expected: ${JSONUtils.stringify(testModel.toJSON().flat)}. Actual: ${JSONUtils.stringify(flat.toJSON())}`)
    //       }
    //       else {
    //         assert.deepEqual(testModel.toJSON().flat_id, flat.id, `Serialized id only. Expected: ${testModel.toJSON().flat_id}. Actual: ${flat.id}`)
    //       }
    //       expect(testModel.data.flat_id).toBe(flat.id)

    //     })
    //   }),
    // })

    // it('Handles a get query for a hasOne relation', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()

    //     return testModel.get('reverse', (err, reverse) => {

    //       expect(reverse).toBeTruthy()
    //       expect(testModel.id).toBe(reverse.data.owner_id)
    //       expect(testModel.id).toBe(reverse.toJSON().owner_id)
    //       if (testModel.relationIsEmbedded('reverse')) {
    //         assert.deepEqual(testModel.toJSON().reverse, reverse.toJSON(), `Serialized embed. Expected: ${JSONUtils.stringify(testModel.toJSON().reverse)}. Actual: ${JSONUtils.stringify(reverse.toJSON())}`)
    //       }
    //       expect(!testModel.toJSON().reverse_id).toBeTruthy()

    //     })
    //   }),
    // })

    // it('can retrieve an id for a hasOne relation via async virtual method', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()
    //     return testModel.get('reverse_id', (err, id) => {

    //       expect(id).toBeTruthy()

    //     })
    //   }),
    // })

    // it('can retrieve a belongsTo id synchronously and then a model asynchronously from get methods', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()
    //     expect(testModel.data.flat_id).toBeTruthy()
    //     return testModel.get('flat', (err, flat) => {

    //       expect(flat).toBeTruthy()
    //       expect(testModel.data.flat_id).toBe(flat.id)

    //     })
    //   }),
    // })

    // it('Handles a get query for a hasOne and belongsTo two sided relation', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()

    //     return testModel.get('reverse', (err, reverse) => {

    //       expect(reverse).toBeTruthy()
    //       expect(testModel.id).toBe(reverse.data.owner_id)
    //       expect(testModel.id).toBe(reverse.toJSON().owner_id)
    //       if (testModel.relationIsEmbedded('reverse')) {
    //         assert.deepEqual(testModel.toJSON().reverse, reverse.toJSON(), `Serialized embed. Expected: ${JSONUtils.stringify(testModel.toJSON().reverse)}. Actual: ${JSONUtils.stringify(reverse.toJSON())}`)
    //       }
    //       expect(!testModel.toJSON().reverse_id).toBeTruthy()

    //       return reverse.get('owner', (err, owner) => {

    //         expect(owner).toBeTruthy()
    //         assert.deepEqual(reverse.toJSON().owner_id, owner.id, `Serialized id only. Expected: ${reverse.toJSON().owner_id}. Actual: ${owner.id}`)

    //         if (Owner.cache) {
    //           assert.deepEqual(testModel.toJSON(), owner.toJSON(), `\nExpected: ${JSONUtils.stringify(testModel.toJSON())}\nActual: ${JSONUtils.stringify(owner.toJSON())}`)
    //         }
    //         else {
    //           expect(testModel.id).toBe(owner.id)
    //         }

    //       })
    //     })
    //   }),
    // })


    // // TODO: delay the returning of memory models related models to test lazy loading properly
    // it('Fetches a relation from the store if not present', async () => {
    //   const testModel = await Owner.findOne()

    //     expect(testModel).toBeTruthy()

    //     const fetched_owner = new Owner({id: testModel.id})
    //     return fetched_owner.fetch((err) => {

    //       delete fetched_owner.attributes.reverse

    //       return fetched_owner.get('reverse', (err, reverse) => {
    //         if (fetched_owner.relationIsEmbedded('reverse')) {

    //           expect(!reverse).toBeTruthy()

    //         }

    //         expect(reverse).toBeTruthy()
    //         assert.equal(reverse.data.owner_id, testModel.id)


    //       })
    //     })
    //   }),
    // })
    //          expect(reverse).toBe(null)
