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

  return describe(`RestController (sorted: true, ${options.$tags}, framework: ${options.app_framework.name})`, () => {
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

    //#####################################
    // index
    //#####################################

    return describe('index', () => {
      it('should return json for all models with no query', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = MODELS_JSON), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name', $select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, 'name'))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key respecting whitelist (key included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, 'name'))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => [])), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, ['name', 'created_at']))), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (keys included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, ['name', 'created_at']))), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'created_at',  $select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortO(_.map(MODELS_JSON, item => _.pick(item, ['created_at'])), 'created_at')), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (keys excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => ({}))), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key (in array)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key respecting whitelist (key included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => null))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name', 'created_at']))))), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys respecting whitelist (keys included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name', 'created_at']))))), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name']))))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      return it('should select requested values by an array of keys respecting whitelist (keys excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => []))), (actual = res.body), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })
    })
  })
}),
)
