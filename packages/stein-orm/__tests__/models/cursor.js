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
    jsonObject: 'json',
    jsonList: 'json',
    jsonObjectList: 'json',
    boolean: 'Boolean',
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
      jsonObject: {foo: {bar: 'baz'}, fizz: 'buzz'},
      jsonList: ['aaa', 'bbb', 'ccc'],
      jsonObjectList: [{foo: 'bar'}, {fizzbuzz: {fizz: true, buzz: 'zz'}}],
      createdDate: Fabricator.date,
      updatedDate: Fabricator.date,
      boolean: true,
    })
  })

  afterAll(() => Flat.store.disconnect())

  it('can use callbacks', (done) => {
    Flat.cursor({$count: true}).toJSON((err, count) => {
      expect(err).toBeFalsy()
      expect(count).toBe(BASE_COUNT)

      Flat.cursor().toModels((err, models) => {
        expect(err).toBeFalsy()
        expect(models.length).toBe(BASE_COUNT)

        Flat.find({}, (err, models) => {
          expect(err).toBeFalsy()
          expect(models.length).toBe(BASE_COUNT)
          done()
        })
      })
    })
  })

  it('counts with toJSON', async () => {
    const count = await Flat.cursor({$count: true}).toJSON()
    expect(count).toBe(BASE_COUNT)
  })

  it('makes model json', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()
    expect(model.id).toBeTruthy()
    expect(model.data.jsonObject.foo.bar).toBe('baz')
    expect(model.data.jsonList.length).toBe(3)
    expect(model.data.jsonList[0]).toBe('aaa')
    expect(model.data.jsonObjectList.length).toBe(2)
    expect(model.data.jsonObjectList[1].fizzbuzz.buzz).toBe('zz')
    expect(typeof model.data.boolean).toBe('boolean')

    const json = await Flat.cursor({id: model.id}).toJSON()
    expect(json.length).toBe(1)
  })

  it('makes models', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()

    const models = await Flat.cursor({id: model.id}).toModels()
    expect(models.length).toBe(1)
    expect(models[0].data).toBeTruthy()
    expect(models[0].id).toBe(model.id)
    expect(models[0] instanceof Flat).toBeTruthy()

    const models2 = await Flat.cursor().toModels()
    _.forEach(models2, m => {
      expect(models2.length).toBe(BASE_COUNT)
      expect(m.data).toBeTruthy()
      expect(m instanceof Flat).toBeTruthy()
    })
  })

  it('can chain limit', async () => {
    const limit = 3
    const models = await Flat.cursor().limit(limit).toModels()
    expect(models.length).toBe(limit)
  })

  it('can chain limit and offset', async () => {
    const limit = 3
    const offset = 3
    const models = await Flat.cursor().limit(limit).offset(offset).toModels()
    expect(models.length).toBe(limit)
  })

  it('can select json', async () => {
    const model = await Flat.cursor({$one: true}).toJSON()
    expect(model.jsonObject).toBeTruthy()
    expect(model.jsonObject.foo.bar).toBe('baz')
    expect(model.createdDate instanceof Date).toBeTruthy()
  })

  it('can select fields', async () => {
    const fields = ['id', 'name']
    const models = await Flat.cursor().select(fields).toJSON()
    _.forEach(models, model => {
      expect(model.id).toBeTruthy()
      expect(model.name).toBeTruthy()
      expect(model.jsonObject).toBeFalsy()
    })
  })

  it('can select the intersection of a whitelist and fields', async () => {
    const whitelist = ['name']
    const fields = ['id', 'name']
    const models = await Flat.cursor({$whitelist: whitelist}).select(fields).toJSON()
    _.forEach(models, model => {
      expect(model.id).toBeFalsy()
      expect(model.name).toBeTruthy()
      expect(model.name.startsWith('flat_')).toBeTruthy()
      expect(_.size(model)).toBe(whitelist.length)
    })
  })

  it('can select values', async () => {
    const values = ['id', 'name']
    const results = await Flat.cursor().values(values).toJSON()
    _.forEach(results, res => {
      expect(res.length).toBe(values.length)
      expect(res[0]).toBeTruthy()
      expect(res[1]).toBeTruthy()
    })
    expect(results[0][0]).toBe('1')
    expect(results[0][1].startsWith('flat_')).toBeTruthy()
  })

  it('can select the intersection of a whitelist and values', async () => {
    const whitelist = ['name']
    const values = ['id', 'name']
    const results = await Flat.cursor({$whitelist: whitelist}).values(values).toJSON()
    _.forEach(results, res => {
      expect(res.length).toBe(whitelist.length)
      expect(res[0]).toBeTruthy()
      expect(res[1]).toBeFalsy()
    })
    expect(results[0][0].startsWith('flat_')).toBeTruthy()
  })

  it('can select the intersection of a whitelist and fields', async () => {
    const whitelist = ['name']
    const fields = ['id', 'name']
    const models = await Flat.cursor({$whitelist: whitelist}).select(fields).toJSON()
    _.forEach(models, model => {
      expect(model.id).toBeFalsy()
      expect(model.name).toBeTruthy()
      expect(model.name.startsWith('flat_')).toBeTruthy()
      expect(_.size(model)).toBe(whitelist.length)
    })
  })

  it('can perform an $in query', async () => {
    const model = await Flat.cursor({$one: true}).toJSON()
    const $in = ['random_string', 'some_9', model.name]
    const models = await Flat.cursor({name: {$in}}).toJSON()
    expect(models.length).toBe(1)
    const model2 = models[0]
    expect(model2.id).toBe(model.id)
    expect(model2.name).toBe(model.name)
  })

  it('can perform an $in query on a json primitive array', async () => {
    const newModel = new Flat({jsonList: ['123', '456', '11111', '566678', '99']})
    await newModel.save()

    let models = await Flat.cursor({jsonList: {$in: ['123']}}).toJSON()
    expect(models.length).toBe(1)
    let model2 = models[0]
    expect(model2.id).toBe(newModel.id)
    expect(model2.jsonList.length).toBe(5)
  })

  it('can perform a query on a json object array', async () => {
    const newModel = new Flat({jsonObjectList: [{testo: 'auto'}, {another: 'yep'}]})
    await newModel.save()

    const models = await Flat.cursor({'jsonObjectList.testo': 'auto'}).toJSON()
    expect(models.length).toBe(1)
    const model2 = models[0]
    expect(model2.id).toBe(newModel.id)
    expect(_.size(model2.jsonObjectList)).toBe(2)
  })

  it('can chain limit with paging', async () => {
    const LIMIT = 3
    const data = await Flat.cursor({$page: true}).limit(LIMIT).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('can chain limit without paging', async () => {
    const LIMIT = 3
    const data = await Flat.cursor({$page: false}).limit(LIMIT).toJSON()
    expect(data.length).toBe(LIMIT)
  })

  it('can chain offset without paging', async () => {
    const OFFSET = 1; const COUNT = BASE_COUNT - OFFSET
    const data = await Flat.cursor({$page: false}).offset(OFFSET).toJSON()
    expect(data.length).toBe(COUNT)
  })

  it('can chain limit and offset with paging', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$page: true}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.offset).toBe(OFFSET)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('can chain limit with paging (no true or false)', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$page: ''}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.offset).toBe(OFFSET)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('can select fields with paging', async () => {
    const FIELD_NAMES = ['id', 'name']
    const data = await Flat.cursor({$page: true}).select(FIELD_NAMES).toJSON()
    expect(_.isArray(data.rows)).toBeTruthy()
    for (const json of data.rows) {
      expect(_.size(json)).toBe(FIELD_NAMES.length)
    }
  })

  it('can select values with paging', async () => {
    const FIELD_NAMES = ['id', 'name']
    const data = await Flat.cursor({$page: true}).values(FIELD_NAMES).toJSON()
    expect(_.isArray(data.rows)).toBeTruthy()
    for (const json of data.rows) {
      expect(_.isArray(json)).toBeTruthy()
      expect(json.length).toBe(FIELD_NAMES.length)
    }
  })

  it('returns the correct value', async () => {
    const model = await Flat.findOne()
    expect(model).toBeTruthy()
    const data = await Flat.cursor({$page: true, name: model.data.name}).toJSON()
    expect(data.totalRows).toBe(1)
    expect(data.rows.length).toBe(1)
    expect(model.toJSON().id).toBe(data.rows[0].id)
  })

  it('returns an array of one when paging one', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$page: '', $one: true}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.offset).toBe(OFFSET)
    expect(data.rows.length).toBe(1)
  })

  it('(unique) handles a find unique query on one field', async () => {
    const results = await Flat.cursor({$unique: 'name'}).toJSON()
    expect(results.length).toBe(BASE_COUNT)
  })

  it('(unique) handles a find unique query on one field and gives the correct result with sort', async () => {
    const new_updatedDate = new Date(new Date().getTime() + (60*1000))
    const model = new Flat({updatedDate: new_updatedDate})
    await model.save()
    const results = await Flat.cursor({$unique: 'name'}).select('createdDate', 'updatedDate').sort('-updatedDate').limit(1).toJSON()
    expect(results.length).toBe(1)
    const retrieved_clone = results[0]
    expect(retrieved_clone.createdDate).toBe(null)
    expect(retrieved_clone.updatedDate.getTime()).toBe(new_updatedDate.getTime())
  })

  it('(unique) handles a find unique query on name with $select', async () => {
    const results = await Flat.cursor({$unique: ['name'], $select: ['id']}).toJSON()
    expect(results.length).toBe(BASE_COUNT)
    for (const result of results) {
      expect(_.keys(result).length).toBe(1)
      expect(_.keys(result)[0]).toBe('id')
    }
  })

  it('(unique) handles a find unique query on name with select (chaining)', async () => {
    const results = await Flat.cursor().unique('name').select('id').toJSON()
    expect(results.length).toBe(BASE_COUNT)
    for (const result of results) {
      expect(_.keys(result).length).toBe(1)
      expect(_.keys(result)[0]).toBe('id')
    }
  })

  it('(unique) handles a find unique query on name with $select name', async () => {
    const results = await Flat.cursor({$unique: ['name'], $select: ['name']}).toJSON()
    expect(results.length).toBe(BASE_COUNT)
    for (const result of results) {
      expect(_.keys(result).length).toBe(1)
      expect(_.keys(result)[0]).toBe('name')
    }
  })

  it('(unique) handles a find unique query on name with $values', async () => {
    const results = await Flat.cursor({$unique: ['name'], $values: ['id']}).toJSON()
    expect(results.length).toBe(BASE_COUNT)
    for (const result of results) {
      expect(!_.isObject(result)).toBeTruthy()
    }
  })

  it('(unique) handles a find unique query on name with $values name', async () => {
    const results = await Flat.cursor({$unique: ['name'], $values: ['name']}).toJSON()
    expect(results.length).toBe(BASE_COUNT)
    for (const result of results) {
      expect(!_.isObject(result)).toBeTruthy()
    }
  })

  it('(unique) handles a find unique query with count', async () => {
    const result = await Flat.count({$unique: 'name'})
    expect(result).toBe(BASE_COUNT)
  })

  // TODO: test more edge cases
  it('(unique) handles a find unique query with count on empty collection', async () => {
    const Empty = createModel({url: `${DATABASE_URL}/empties`, schema: {name: 'Text'}})(class Empty extends Model {})
    await Empty.store.resetSchema({})
    const result = await Empty.count({$unique: 'name'})
    expect(result).toBe(0)
  })

  it('(unique) can chain limit with paging', async () => {
    const LIMIT = 3
    const data = await Flat.cursor({$unique: ['name'], $page: true}).limit(LIMIT).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('(unique) can chain limit without paging', async () => {
    const LIMIT = 3
    const data = await Flat.cursor({$unique: ['name'], $page: false}).limit(LIMIT).toJSON()
    expect(data.length).toBe(LIMIT)
  })

  it('(unique) can chain offset without paging', async () => {
    const OFFSET = 1; const COUNT = BASE_COUNT - OFFSET
    const data = await Flat.cursor({$unique: ['name'], $page: false}).offset(OFFSET).toJSON()
    expect(COUNT).toBe(data.length)
  })

  it('(unique) can chain limit and offset with paging', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$unique: ['name'], $page: true}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.offset).toBe(OFFSET)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('(unique) can chain limit with paging (no true or false)', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$unique: ['name'], $page: ''}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(data.offset).toBe(OFFSET)
    expect(data.rows.length).toBe(LIMIT)
  })

  it('(unique) can select fields with paging', async () => {
    const FIELD_NAMES = ['id', 'name']
    const data = await Flat.cursor({$unique: ['name'], $page: true}).select(FIELD_NAMES).toJSON()
    expect(_.isArray(data.rows)).toBeTruthy()
    for (const json of data.rows) {
      expect(_.size(json)).toBe(FIELD_NAMES.length)
    }
  })

  it('(unique) can select values with paging', async () => {
    const FIELD_NAMES = ['id', 'name']
    const data = await Flat.cursor({$unique: ['name'], $page: true}).values(FIELD_NAMES).toJSON()
    expect(_.isArray(data.rows)).toBeTruthy()
    for (const json of data.rows) {
      expect(_.isArray(json)).toBeTruthy()
      expect(json.length).toBe(FIELD_NAMES.length)
    }
  })

  it('(unique) returns an array of one with $page and $one', async () => {
    const LIMIT = 3; const OFFSET = 1
    const data = await Flat.cursor({$unique: ['name'], $page: '', $one: true}).limit(LIMIT).offset(OFFSET).toJSON()
    expect(data.rows).toBeTruthy()
    expect(data.totalRows).toBe(BASE_COUNT)
    expect(OFFSET).toBe(data.offset)
    expect(1).toBe(data.rows.length)
  })

})
