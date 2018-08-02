/* eslint-disable
    func-names,
    import/no-unresolved,
    no-undef,
    no-unused-vars,
    one-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let exports
const util = require('util')
const assert = require('assert')

const BackboneORM = require('backbone-orm')
const { _, Backbone, Queue, Utils, JSONUtils, Fabricator } = BackboneORM

const request = require('supertest')

const RestController = require('../../lib/index')

const sortO = (array, field) => _.sortBy(array, obj => JSON.stringify(obj[field]))
const sortA = array => _.sortBy(array, item => JSON.stringify(item))

_.each(BackboneORM.TestUtils.optionSets(), (exports = function(options) {
  if (typeof __test__parameters !== 'undefined' && __test__parameters !== null) { options = _.extend({}, options, __test__parameters) }
  if (typeof __test__app_framework !== 'undefined' && __test__app_framework !== null) { options.app_framework = __test__app_framework }
  if (options.embed && !options.sync.capabilities(options.database_url || '').embed) { return }

  const DATABASE_URL = options.database_url || ''
  const BASE_SCHEMA = options.schema || {}
  const SYNC = options.sync
  const BASE_COUNT = 5

  const APP_FACTORY = options.app_framework.factory
  let MODELS_JSON = null
  const ROUTE = '/test/flats'

  return describe(`RestController (page: true, ${options.$tags}, framework: ${options.app_framework.name}) @page`, () => {
    let Flat = null
    before(() => {
      BackboneORM.configure({model_cache: {enabled: !!options.cache, max: 100}})

      return Flat = (function() {
        Flat = class Flat extends Backbone.Model {
          static initClass() {
            this.prototype.urlRoot = `${DATABASE_URL}/flats`
            this.prototype.schema = _.defaults({
              boolean: 'Boolean',
            }, BASE_SCHEMA)
            this.prototype.sync = SYNC(Flat, options.cache)
          }
        }
        Flat.initClass()
        return Flat
      }())
    })

    after(callback => Utils.resetSchemas([Flat], callback))

    beforeEach(callback =>
      Utils.resetSchemas([Flat], (err) => {
        if (err) { return callback(err) }

        return Fabricator.create(Flat, BASE_COUNT, {
          name: Fabricator.uniqueId('flat_'),
          created_at: Fabricator.date,
          updated_at: Fabricator.date,
        }, (err, models) => {
          if (err) { return callback(err) }

          return Flat.find({$ids: _.pluck(models, 'id')}, (err, models) => { // reload models in case they are stored with different date precision
            if (err) { return callback(err) }
            MODELS_JSON = JSONUtils.parse(sortO(_.map(models, test => test.toJSON()), 'name')) // need to sort because not sure what order will come back from database
            return callback()
          })
        })
      }),
    )

    it('Cursor can chain limit with paging', (done) => {
      const LIMIT = 3

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(ROUTE)
        .query(JSONUtils.querify({$page: true, $limit: LIMIT}))
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          assert.ok(data.rows, 'received models')
          assert.equal(data.total_rows, MODELS_JSON.length, 'has the correct total_rows')
          assert.equal(LIMIT, data.rows.length, `Expected: ${LIMIT}, Actual: ${data.rows.length}`)
          return done()
        })
    })

    it('Cursor can chain limit with paging (no true or false)', (done) => {
      const LIMIT = 3

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(`${ROUTE}?$page&$limit=${LIMIT}`)
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          assert.ok(data.rows, 'received models')
          assert.equal(data.total_rows, MODELS_JSON.length, 'has the correct total_rows')
          assert.equal(LIMIT, data.rows.length, `Expected: ${LIMIT}, Actual: ${data.rows.length}`)
          return done()
        })
    })

    it('Cursor can chain limit without paging', (done) => {
      const LIMIT = 3

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(ROUTE)
        .query(JSONUtils.querify({$page: false, $limit: LIMIT}))
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          assert.equal(LIMIT, data.length, `Expected: ${LIMIT}, Actual: ${data.length}`)
          return done()
        })
    })

    it('Cursor can chain limit and offset with paging', (done) => {
      const LIMIT = 2; const OFFSET = 1

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(ROUTE)
        .query(JSONUtils.querify({$page: true, $limit: LIMIT, $offset: OFFSET}))
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          assert.equal(data.total_rows, MODELS_JSON.length, 'has the correct total_rows')
          assert.equal(OFFSET, data.offset, 'has the correct offset')
          assert.equal(LIMIT, data.rows.length, `Expected: ${LIMIT}, Actual: ${data.rows.length}`)
          return done()
        })
    })

    it('Cursor can select fields with paging', (done) => {
      const FIELD_NAMES = ['id', 'name']

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(ROUTE)
        .query(JSONUtils.querify({$page: true, $select: FIELD_NAMES}))
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          for (const json of Array.from(data.rows)) {
            assert.equal(_.size(json), FIELD_NAMES.length, 'gets only the requested values')
          }
          return done()
        })
    })

    it('Cursor can select values with paging', (done) => {
      const FIELD_NAMES = ['id', 'name']

      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

      return request(app)
        .get(ROUTE)
        .query(JSONUtils.querify({$page: true, $values: FIELD_NAMES}))
        .type('json')
        .end((err, res) => {
          let data
          assert.ok(!err, `No errors: ${err}`)
          assert.ok(!!(data = res.body), 'got data')
          assert.ok(_.isArray(data.rows), 'cursor values is an array')
          for (const json of Array.from(data.rows)) {
            assert.ok(_.isArray(json), 'cursor item values is an array')
            assert.equal(json.length, FIELD_NAMES.length, 'gets only the requested values')
          }
          return done()
        })
    })

    return it('Ensure the correct value is returned', done =>
      Flat.findOne((err, model) => {
        assert.ok(!err, `No errors: ${err}`)
        assert.ok(!!model, 'model')

        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$page: true, name: model.get('name')}))
          .type('json')
          .end((err, res) => {
            let actual,
              data,
              expected
            assert.ok(!err, `No errors: ${err}`)
            assert.ok(!!(data = res.body), 'got data')
            assert.equal(data.total_rows, 1, 'has the correct total_rows')
            assert.equal(data.rows.length, 1, 'has the correct row.length')
            assert.deepEqual((expected = model.toJSON()), (actual = JSONUtils.parse(data.rows[0])), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      }),
    )
  })
}),
)
