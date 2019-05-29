/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { createModel, Model } from '../../src/'
import Fabricator from '../../src/lib/Fabricator'
import Utils from '../../src/lib/utils'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  Store: require('stein-orm-sql').default,
  url: `${DATABASE_URL}/flats`,
  schema: {
    name: 'Text',
    createdDate: 'DateTime',
    createdDate2: 'DateTime',
    updatedDate: 'DateTime',
    jsonObject: 'json',
    jsonList: 'json',
    jsonObjectList: 'json',
    boolean: 'Boolean',
  },
}


const BASE_COUNT = 10
const DATE_INTERVAL_MS = 1000
const START_DATE = new Date()
const END_DATE = new Date(START_DATE.getTime() + ((BASE_COUNT - 1) * DATE_INTERVAL_MS))

describe('Class methods', () => {
  let Flat = null

  beforeEach(async () => {
    Flat = createModel(options)(class Flat extends Model {})
    await Flat.store.resetSchema({verbose: process.env.VERBOSE})

    return Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date(START_DATE, DATE_INTERVAL_MS),
      updatedDate: Fabricator.date,
      boolean: true,
    })
  })

  afterAll(() => Flat.store.disconnect())

  it('handles a limit query', async () => {
    const models = await Flat.find({$limit: 3})
    expect(models.length).toBe(3)
  })

  it('handles a find id query', async () => {
    const model = await Flat.findOne()

    expect(model).toBeTruthy()
    return Flat.find(model.id, (err, model) => {

      expect(model).toBeTruthy()
      expect(model.id).toBe(model.id)
    })
  })

  it('handles a findOne query by id', async () => {
    const model = await Flat.findOne({$sort: '-name'})
    expect(model).toBeTruthy()
    expect(model.id).toBeTruthy()
    const model2 = await Flat.findOne(model.id)
    expect(model2).toBeTruthy()
    expect(model2.id).toBe(model.id)
  })

  it('handles another find id query', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    const model2 = Flat.find(model.id)
    expect(model).toBeTruthy()
    expect(model.id).toBe(model.id)
  })

  it('handles a find by query id', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    const models = await Flat.find({id: model.id})
    expect(models.length).toBe(1)
    expect(models[0].id).toBe(model.id)
  })

  it('handles a name find query', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    const models = await Flat.find({name: model.data.name})
    expect(models.length).toBeTruthy()
    for (const model2 of models) {
      expect(model2.data.name).toBe(model.data.name)
    }
  })

  it('handles a find $in query', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    const $in = ['random_string', 'some_9', model.data.name]
    const models = await Flat.find({name: {$in}})
    expect(models.length).toBeTruthy()
    for (const model2 of models) {
      expect(model2.data.name).toBe(model.data.name)
    }
  })

  it('Find can retrieve a boolean as a boolean', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()
    expect(typeof model.data.boolean).toBe('boolean')
    expect(model.data.boolean).toBe(true)
  })

  it('handles null finds', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    await model.save({name: null})
    const models = await Flat.find({name: null})
    expect(models.length).toBe(1)
    expect(_.isNull(models[0].data.name)).toBeTruthy()
  })

  it('handles $ne for strings', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: '-createdDate'})

    expect(model).toBeTruthy()
    await model.save({name: NAME})

    const models = await Flat.find({name: {$ne: NAME}})
    expect(models.length).toBe(BASE_COUNT-1)

    for (const model2 of models) {
      expect(model2.data.name).not.toBe(NAME)
    }

    const models2 = await Flat.find({name: {$ne: null}})
    expect(models2.length).toBe(BASE_COUNT)

    for (const model3 of models2) {
      expect(!_.isNull(model3.data.name)).toBeTruthy()
    }

    const models4 = await Flat.find({name: null})
    expect(models4.length).toBe(0)
  })

  it('handles $ne with null for strings', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: '-createdDate'})
    expect(model).toBeTruthy()
    await model.save({name: null})

    const models = await Flat.find({name: {$ne: NAME}})
    expect(models.length).toBe(BASE_COUNT)

    const models2 = await Flat.find({name: {$ne: null}})

    expect(models2.length).toBe(BASE_COUNT-1)
    for (const model2 of models2) {
      expect(!_.isNull(model2.data.name)).toBeTruthy()
    }

    const models3 = await Flat.find({name: null})
    expect(models3.length).toBe(1)
    expect(_.isNull(models3[0].data.name)).toBeTruthy()
  })

  it('handles $ne for dates', async () => {
    const models = await Flat.find({createdDate: {$ne: START_DATE}})

    expect(models.length).toBe(BASE_COUNT-1)
    for (const model2 of models) {
      expect(!_.isEqual(model2.data.createdDate, START_DATE)).toBeTruthy()
    }

    const models2 = await Flat.find({createdDate: {$ne: null}})
    expect(models2.length).toBe(BASE_COUNT)
    for (const model3 of models2) {
      expect(!_.isNull(model3.data.createdDate)).toBeTruthy()
    }

    const models3 = await Flat.find({createdDate: null})
    expect(models3.length).toBe(0)
  })

  it('handles $ne with null for dates', async () => {
    const model = await Flat.findOne({$sort: '-createdDate'})

    expect(model).toBeTruthy()
    await model.save({createdDate: null})

    const models = await Flat.find({createdDate: {$ne: END_DATE}})
    expect(models.length).toBe(BASE_COUNT)

    const models2 = await Flat.find({createdDate: {$ne: null}})
    expect(models2.length).toBe(BASE_COUNT-1)
    for (const model2 of models2) {
      expect(!_.isNull(model2.data.createdDate)).toBeTruthy()
    }

    const models3 = await Flat.find({createdDate: null})
    expect(models3.length).toBe(1)
    expect(_.isNull(models3[0].data.createdDate)).toBeTruthy()
  })

  it('handles $ne with null and another value', async () => {
    const model = await Flat.findOne({$sort: '-createdDate'})

    expect(model).toBeTruthy()
    await model.save({createdDate: null})

    const models = await Flat.find({createdDate: {$ne: null, $gte: START_DATE}})

    expect(models.length).toBe(BASE_COUNT-1)
    for (const model2 of models) {
      expect(!_.isNull(model2.data.createdDate)).toBeTruthy()
    }
  })

  it('handles $lt and $lte boundary conditions', async () => {
    const models = await Flat.find({createdDate: {$lt: START_DATE}})
    expect(models.length).toBe(0)
    const models2 = await Flat.find({createdDate: {$lte: START_DATE}})
    expect(models2.length).toBe(1)
  })

  it('handles $lt and $lte boundary conditions with step', async () => {
    const NEXT_DATE = new Date(START_DATE.getTime() + DATE_INTERVAL_MS)
    const models = await Flat.find({createdDate: {$lt: NEXT_DATE}})
    expect(models.length).toBe(1)
    const models2 = await Flat.find({createdDate: {$lte: NEXT_DATE}})
    expect(models2.length).toBe(2)
  })

  it('handles $lt and $lte with find equal', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: 'createdDate'})
    expect(model).toBeTruthy()
    await model.save({name: NAME})

    const models = await Flat.find({name: NAME, createdDate: {$lt: END_DATE}})
    expect(models.length).toBe(1)
    for (const model2 of models) {
      expect(model2.data.name).toBeTruthy()
    }

    const models2 = await Flat.find({name: NAME, createdDate: {$lte: END_DATE}})
    expect(models2.length).toBe(1)
    for (const model3 of models2) {
      expect(model.data.name).toBe(NAME)
    }
  })

  it('handles $lt and $lte with find not equal', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: 'createdDate'})

    expect(model).toBeTruthy()
    await model.save({name: NAME})

    const models = await Flat.find({name: {$ne: NAME}, createdDate: {$lt: END_DATE}})
    expect(models.length).toBe(BASE_COUNT-2)
    for (const model2 of models) {
      expect(model2.data.name).not.toBe(NAME)
    }

    const models2 = await Flat.find({name: {$ne: NAME}, createdDate: {$lte: END_DATE}})
    expect(models2.length).toBe(BASE_COUNT-1)
  })

  it('handles $gt and $gte boundary conditions', async () => {
    const models = await Flat.find({createdDate: {$gt: END_DATE}})
    expect(models.length).toBe(0)
    const models2 = await Flat.find({createdDate: {$gte: END_DATE}})
    expect(models2.length).toBe(1)
  })

  it('handles $gt and $gte boundary conditions with step', async () => {
    const PREVIOUS_DATE = new Date(END_DATE.getTime() - DATE_INTERVAL_MS)

    const models = await Flat.find({createdDate: {$gt: PREVIOUS_DATE}})
    expect(models.length).toBe(1)
    const models2 = await Flat.find({createdDate: {$gte: PREVIOUS_DATE}})
    expect(models2.length).toBe(2)
  })

  it('handles $gt and $gte with find equal', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: '-createdDate'})
    expect(model).toBeTruthy()
    await model.save({name: NAME})

    const models = await Flat.find({name: NAME, createdDate: {$gt: START_DATE}})
    expect(models.length).toBe(1)
    for (const model2 of models) {
      expect(model2.data.name).toBe(NAME)
    }

    const models2 = await Flat.find({name: NAME, createdDate: {$gte: START_DATE}})

    expect(models2.length).toBe(1)

    for (const model3 of models2) {
      expect(model3.data.name).toBe(NAME)
    }
  })

  it('handles $gt and $gte with find not equal', async () => {
    const NAME = 'Bob'
    const model = await Flat.findOne({$sort: '-createdDate'})
    expect(model).toBeTruthy()
    await model.save({name: NAME})


    const models = await Flat.find({name: {$ne: NAME}, createdDate: {$gt: START_DATE}})

    expect(models.length).toBe(BASE_COUNT-2)
    for (const model2 of models) {
      expect(model2.data.name).not.toBe(NAME)
    }

    const models2 = await Flat.find({name: {$ne: NAME}, createdDate: {$gte: START_DATE}})
    expect(models2.length).toBe(BASE_COUNT-1)
    for (const model3 of models2) {
      expect(model3.data.name).not.toBe(NAME)
    }
  })

  it('handles an empty $ids query', async () => {
    const models = await Flat.find({$ids: []})
    expect(models.length).toBe(0)
  })

  it('handles an empty find $in query', async () => {
    const models = await Flat.find({name: {$in: []}})
    expect(models.length).toBe(0)
  })

  it('throws an error for an undefined $ids query', async () => {
    expect.assertions(1)
    try {
      const models = await Flat.find({$ids: undefined})
    }
    catch (e) {
      expect(e).toBeTruthy()
    }
  })

  it('throws an error for an undefined find $in query', async () => {
    expect.assertions(1)
    try {
      const models = await Flat.find({name: {$in: undefined}})
    }
    catch (e) {
      expect(e).toBeTruthy()
    }
  })

  it('handles a find $in query on id', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()
    const $in = [999, model.id]

    const models = await Flat.find({id: {$in}})
    expect(models.length).toBeTruthy()
    for (const model2 of models) {
      expect(model2.data.name).toBe(model.data.name)
    }
  })

  it('handles a find $nin query', async () => {
    const model = await Flat.findOne()

    expect(model).toBeTruthy()
    const $nin = ['random_string', 'some_9']

    const models = await Flat.find({name: {$nin}})

    expect(models.length).toBe(BASE_COUNT)
    $nin.push(model.data.name)

    const models2 = await Flat.find({name: {$nin}})

    expect(models2.length).toBe(BASE_COUNT-1)
    for (const model2 of models2) {
      expect(model2.data.name).not.toBe(model.data.name)
    }
  })

  it('handles a find $nin query on id', async () => {
    const model = await Flat.findOne()

    expect(model).toBeTruthy()
    const $nin = [999, 9999]

    const models = await Flat.find({id: {$nin}})
    expect(models.length).toBe(BASE_COUNT)

    $nin.push(model.id)
    const models2 = await Flat.find({id: {$nin}})

    expect(models2.length).toBe(BASE_COUNT-1)
    for (const model2 of models2) {
      expect(model2.data.name).not.toBe(model.data.name)
    }
  })

  it('handles a $exists true - exists', async () => {
    const models = await Flat.find({createdDate: {$exists: true}})
    expect(models.length).toBe(BASE_COUNT)
  })

  it('handles a $exists false - exists', async () => {
    const models = await Flat.find({createdDate: {$exists: false}})
    expect(models.length).toBe(0)
  })

  it('handles a $exists true - not exists', async () => {
    const models = await Flat.find({createdDate2: {$exists: true}})
    expect(models.length).toBe(0)
  })

  it('handles a $exists false - not exists', async () => {
    const models = await Flat.find({createdDate2: {$exists: false}})
    expect(models.length).toBe(BASE_COUNT)
  })

  it('handles a sort by one field query', async () => {
    const SORT_FIELD = 'name'
    const models = await Flat.find({$sort: SORT_FIELD})
    expect(Utils.isSorted(models, [SORT_FIELD])).toBeTruthy()
  })

  it('handles a sort by multiple fields query', async () => {
    const SORT_FIELDS = ['name', 'id']
    const models = await Flat.find({$sort: SORT_FIELDS})
    expect(Utils.isSorted(models, SORT_FIELDS)).toBeTruthy()
  })

  it('handles a reverse sort by fields query', async () => {
    const SORT_FIELDS = ['-name', 'id']
    const models = await Flat.find({$sort: SORT_FIELDS})
    expect(Utils.isSorted(models, SORT_FIELDS)).toBeTruthy()
  })

  it('should sort by id', async () => {
    const models = await Flat.cursor().sort('id').toModels()
    const ids = (models).map((model) => model.id)
    const sorted_ids = _.sortBy(_.clone(ids), i => +i)
    expect(ids).toEqual(sorted_ids)
  })

})
