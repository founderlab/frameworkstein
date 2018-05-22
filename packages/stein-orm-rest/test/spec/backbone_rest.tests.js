/* eslint-disable
    func-names,
    import/no-unresolved,
    no-dupe-keys,
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
const {_, Backbone, Queue, Utils, JSONUtils, Fabricator} = BackboneORM

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

  return describe(`RestController (sorted: false, ${options.$tags}, framework: ${options.app_framework.name})`, () => {
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

    describe('index', () => {

      it('should return json for all models with no query', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = MODELS_JSON), (actual = sortO(JSONUtils.parse(res.body), 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, 'name'))), (actual = sortO(res.body, 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key respecting whitelist (key included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, 'name'))), (actual = sortO(res.body, 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by single key respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => [])), (actual = sortO(res.body, 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, ['name', 'created_at']))), (actual = sortO(JSONUtils.parse(res.body), 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (keys included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => _.pick(item, ['name', 'created_at']))), (actual = sortO(JSONUtils.parse(res.body), 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortO(_.map(MODELS_JSON, item => _.pick(item, ['created_at'])), 'created_at')), (actual = sortO(JSONUtils.parse(res.body), 'created_at')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested keys by an array of keys respecting whitelist (keys excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$select: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.map(MODELS_JSON, item => ({}))), (actual = sortO(res.body, 'name')), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key (when a template is present)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, templates: {show: {$select: ['name']}}, default_template: 'show'})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key (in array)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: ['name']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key respecting whitelist (key included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => item.name))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by single key respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: 'name'}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => null))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name', 'created_at']))))), (actual = sortA(JSONUtils.parse(res.body))), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys respecting whitelist (keys included)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name', 'created_at']))))), (actual = sortA(JSONUtils.parse(res.body))), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      it('should select requested values by an array of keys respecting whitelist (key excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => _.values(_.pick(item, ['name']))))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      return it('should select requested values by an array of keys respecting whitelist (keys excluded)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        return request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$values: ['name', 'created_at']}))
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = sortA(_.map(MODELS_JSON, item => []))), (actual = sortA(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })
    })

    //#####################################
    // show
    //#####################################

    describe('show', () => {
      it('should find an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        return request(app)
          .get(`${ROUTE}/${MODELS_JSON[0].id}`)
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            console.dir(res.body, {depth: null, colors: true})
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = MODELS_JSON[0]), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })

      return it('should find an existing model with whitelist', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {show: ['id', 'name', 'created_at']}})

        const attributes = _.clone(MODELS_JSON[0])
        return request(app)
          .get(`${ROUTE}/${attributes.id}`)
          .type('json')
          .end((err, res) => {
            let actual,
              expected
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual((expected = _.pick(attributes, ['id', 'name', 'created_at'])), (actual = JSONUtils.parse(res.body)), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
            return done()
          })
      })
    })

    //#####################################
    // create
    //#####################################

    describe('create', () => {
      it('should create a new model and assign an id', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const attributes = {name: _.uniqueId('name_'), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString()}
        return request(app)
          .post(ROUTE)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(!!res.body.id, 'assigned an id')
            assert.equal(attributes.name, res.body.name, 'name matches')
            return done()
          })
      })

      it('should create a new model and assign an id with whitelist', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {create: ['id', 'name', 'updated_at']}})

        const attributes = {name: _.uniqueId('name_'), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString()}
        return request(app)
          .post(ROUTE)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(!!res.body.id, 'assigned an id')
            assert.equal(attributes.name, res.body.name, 'name matches')
            assert.equal(attributes.updated_at, res.body.updated_at, 'updated_at matches')
            assert.ok(!res.body.created_at, 'created_at was not returned')
            return done()
          })
      })

      return it('should trigger pre:create and post:create events on create', (done) => {
        const app = APP_FACTORY()

        class EventController extends RestController {
          constructor() {
            super(app, {model_type: Flat, route: ROUTE, default_template: null})
          }
        }
        const controller = new EventController()

        let pre_triggered = false
        let post_triggered = false
        EventController.on('pre:create', (req) => { if (req) { return pre_triggered = true } })
        EventController.on('post:create', (json) => { if (json) { return post_triggered = true } })

        const attributes = {name: _.uniqueId('name_'), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString()}
        return request(app)
          .post(ROUTE)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(pre_triggered, `Pre event trigger: ${pre_triggered}`)
            assert.ok(post_triggered, `Post event trigger: ${post_triggered}`)
            return done()
          })
      })
    })

    //#####################################
    // update
    //#####################################

    describe('update', () => {
      it('should update an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const attributes = _.clone(MODELS_JSON[1])
        attributes.name = `${attributes.name}_${_.uniqueId('name')}`
        return request(app)
          .put(`${ROUTE}/${attributes.id}`)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual(_.omit(attributes, '_rev'), _.omit(JSONUtils.parse(res.body), '_rev'), 'model was updated') // there could be _rev added
            return done()
          })
      })

      it('should update an existing model with whitelist', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {update: ['id', 'name', 'updated_at']}})

        const attributes = _.clone(MODELS_JSON[1])
        attributes.name = `${attributes.name}_${_.uniqueId('name')}`
        return request(app)
          .put(`${ROUTE}/${attributes.id}`)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual(_.pick(attributes, ['id', 'name', 'updated_at']), JSONUtils.parse(res.body), 'model was updated')
            return done()
          })
      })

      return it('should trigger pre:update and post:create events on update', (done) => {
        const app = APP_FACTORY()

        class EventController extends RestController {
          constructor() {
            super(app, {model_type: Flat, route: ROUTE, default_template: null})
          }
        }
        const controller = new EventController()

        let pre_triggered = false
        let post_triggered = false
        EventController.on('pre:update', (req) => { if (req) { return pre_triggered = true } })
        EventController.on('post:update', (json) => { if (json) { return post_triggered = true } })

        const attributes = _.clone(MODELS_JSON[1])
        attributes.name = `${attributes.name}_${_.uniqueId('name')}`
        return request(app)
          .put(`${ROUTE}/${attributes.id}`)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(pre_triggered, `Pre event trigger: ${pre_triggered}`)
            assert.ok(post_triggered, `Post event trigger: ${post_triggered}`)
            return done()
          })
      })
    })

    //#####################################
    // delete
    //#####################################

    describe('delete', () => {
      it('should delete an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const { id } = MODELS_JSON[1]
        return request(app)
          .del(`${ROUTE}/${id}`)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

            return request(app)
              .get(`${ROUTE}/${id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 404, `status 404 on subsequent request. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                return done()
              })
          })
      })

      return it('should trigger pre:destroy and post:destroy events on destroy', (done) => {
        const app = APP_FACTORY()

        class EventController extends RestController {
          constructor() {
            super(app, {model_type: Flat, route: ROUTE, default_template: null})
          }
        }
        const controller = new EventController()

        let pre_triggered = false
        let post_triggered = false
        EventController.on('pre:destroy', (req) => { if (req) { return pre_triggered = true } })
        EventController.on('post:destroy', (json) => { if (json) { return post_triggered = true } })

        const { id } = MODELS_JSON[1]
        return request(app)
          .del(`${ROUTE}/${id}`)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(pre_triggered, `Pre event trigger: ${pre_triggered}`)
            assert.ok(post_triggered, `Post event trigger: ${post_triggered}`)
            return done()
          })
      })
    })

    //#####################################
    // head
    //#####################################

    return describe('head', () => {
      it('should test existence of a model by id', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const { id } = MODELS_JSON[1]
        return request(app)
          .head(`${ROUTE}/${id}`)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

            // delete it
            return request(app)
              .del(`${ROUTE}/${id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

                // check again
                return request(app)
                  .head(`${ROUTE}/${id}`)
                  .end((err, res) => {
                    assert.ok(!err, `no errors: ${err}`)
                    assert.equal(res.status, 404, `status not 404. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                    return done()
                  })
              })
          })
      })

      it('should test existence of a model by id ($exists)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const { id } = MODELS_JSON[1]
        return request(app)
          .get(`${ROUTE}`)
          .query(JSONUtils.querify({id, $exists: ''}))
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(res.body.result, `Exists by id. Body: ${JSONUtils.stringify(res.body)}`)

            // delete it
            return request(app)
              .del(`${ROUTE}/${id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

                // check again
                return request(app)
                  .get(`${ROUTE}`)
                  .query(JSONUtils.querify({id, $exists: ''}))
                  .end((err, res) => {
                    assert.ok(!err, `no errors: ${err}`)
                    assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                    assert.ok(!res.body.result, `Not longer exists by id. Body: ${JSONUtils.stringify(res.body)}`)
                    return done()
                  })
              })
          })
      })

      it('should test existence of a model by name', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const { id } = MODELS_JSON[1]
        const { name } = MODELS_JSON[1]
        return request(app)
          .head(`${ROUTE}`)
          .query(JSONUtils.querify({name}))
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

            // delete it
            return request(app)
              .del(`${ROUTE}/${id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

                // check again
                return request(app)
                  .head(`${ROUTE}`)
                  .query(JSONUtils.querify({name}))
                  .end((err, res) => {
                    assert.ok(!err, `no errors: ${err}`)
                    assert.equal(res.status, 404, `status not 404. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                    return done()
                  })
              })
          })
      })

      return it('should test existence of a model by name ($exists)', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        const { id } = MODELS_JSON[1]
        const { name } = MODELS_JSON[1]
        return request(app)
          .get(`${ROUTE}`)
          .query(JSONUtils.querify({name, $exists: ''}))
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(res.body.result, `Exists by name. Body: ${JSONUtils.stringify(res.body)}`)

            // delete it
            return request(app)
              .del(`${ROUTE}/${id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

                // check again
                return request(app)
                  .get(`${ROUTE}`)
                  .query(JSONUtils.querify({name, $exists: ''}))
                  .end((err, res) => {
                    assert.ok(!err, `no errors: ${err}`)
                    assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                    assert.ok(!res.body.result, `No longer exists by name. Body: ${JSONUtils.stringify(res.body)}`)
                    return done()
                  })
              })
          })
      })
    })
  })
}),
)
