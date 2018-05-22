/* eslint-disable
    func-names,
    import/no-unresolved,
    no-undef,
    no-unused-vars,
    one-var,
    prefer-const,
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
let _,
  Backbone,
  exports,
  Fabricator,
  JSONUtils,
  Utils
const util = require('util')
const assert = require('assert')
let Queue = require('queue-async')
const cacheManager = require('cache-manager')
const redisStore = require('fl-cache-manager-redis')
const BackboneORM = require('backbone-orm');
({_, Backbone, Queue, Utils, JSONUtils, Fabricator} = BackboneORM)

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
  let RELATED_MODELS_JSON = null
  const ROUTE = '/test/flats'
  const RELATED_ROUTE = '/test/related'

  const CACHE_OPTIONS = {
    cache: cacheManager.caching({
      store: redisStore,
      hashFromKey: key => key.split('|')[0],
    }),
    ttl: 100000,
  }

  let Related = null

  return describe(`RestController (sorted: false, ${options.$tags}, framework: ${options.app_framework.name})`, () => {
    let Flat = null
    before(() => {
      BackboneORM.configure({model_cache: {enabled: !!options.cache, max: 100}})

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

      return Related = (function() {
        Related = class Related extends Backbone.Model {
          static initClass() {
            this.prototype.urlRoot = `${DATABASE_URL}/relateds`
            this.prototype.schema = _.defaults({
              boolean: 'Boolean',
              flat: ['belongsTo', Flat],
            }, BASE_SCHEMA)
            this.prototype.sync = SYNC(Related, options.cache)
          }
        }
        Related.initClass()
        return Related
      }())
    })

    after(callback => Utils.resetSchemas([Flat], callback))

    beforeEach(callback =>
      Utils.resetSchemas([Flat, Related], (err) => {
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

            return Fabricator.create(Related, BASE_COUNT, {
              name: Fabricator.uniqueId('rel_'),
              created_at: Fabricator.date,
              updated_at: Fabricator.date,
            }, (err, models) => {
              if (err) { return callback(err) }

              return Related.find({$ids: _.pluck(models, 'id')}, (err, models) => { // reload models in case they are stored with different date precision
                if (err) { return callback(err) }
                RELATED_MODELS_JSON = JSONUtils.parse(sortO(_.map(models, test => test.toJSON()), 'name')) // need to sort because not sure what order will come back from database
                return callback()
              })
            })
          })
        })
      }),
    )

    //#####################################
    // index
    //#####################################

    describe('index', () =>

      it('should return json for all models with no query', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

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
      }),
    )

    //#####################################
    // show
    //#####################################

    describe('show', () =>
      it('should find an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

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
      }),
    )

    //#####################################
    // create
    //#####################################

    describe('create', () => {
      it('should create a new model and assign an id', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const attributes = {name: _.uniqueId('name_'), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString()}
        return request(app)
          .post(ROUTE)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.ok(!!res.body.id, 'assigned an id')
            assert.equal(attributes.name, res.body.name, 'name matches')

            return request(app)
              .get(ROUTE)
              .type('json')
              .end((err, res) => {
                let actual,
                  expected
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                assert.equal((expected = MODELS_JSON.length+1), (actual = res.body.length), `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`)
                return done()
              })
          })
      })

      return it('should clear a related models cache on create', (done) => {
        const app = APP_FACTORY()
        const cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        const related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const { id } = MODELS_JSON[1]
        const related_id = RELATED_MODELS_JSON[1].id
        const attributes = {name: _.uniqueId('name_'), created_at: (new Date()).toISOString(), updated_at: (new Date()).toISOString()}
        const queue = new Queue(1)

        queue.defer(callback =>
          request(app)
            .get(`${RELATED_ROUTE}/${related_id}`)
            .end((err, res) => {
              console.log(err, res.body)
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return callback()
            }),
        )

        queue.defer(callback =>
          request(app)
            .post(ROUTE)
            .send(attributes)
            .end((err, res) => {
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return Related.destroy({id: related_id}, callback)
            }),
        )

        queue.defer(callback =>
          Related.exists({id: related_id}, (err, exists) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.ok(!exists, `related model doesn't exist in db: ${exists}`)

            return request(app)
              .get(`${RELATED_ROUTE}/${related_id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 404, `status 404 on subsequent request. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                return callback()
              })
          }),
        )

        return queue.await(done)
      })
    })

    //#####################################
    // update
    //#####################################

    describe('update', () => {
      it('should update an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const attributes = _.clone(MODELS_JSON[1])
        attributes.name = `${attributes.name}_${_.uniqueId('name')}`
        return request(app)
          .put(`${ROUTE}/${attributes.id}`)
          .send(attributes)
          .end((err, res) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
            assert.deepEqual(_.omit(attributes, '_rev'), _.omit(JSONUtils.parse(res.body), '_rev'), 'model was updated') // there could be _rev added

            return request(app)
              .get(`${ROUTE}/${attributes.id}`)
              .type('json')
              .end((err, res) => {
                console.dir(res.body, {depth: null, colors: true})
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                assert.deepEqual(_.omit(attributes, '_rev'), _.omit(JSONUtils.parse(res.body), '_rev'), 'model was updated') // there could be _rev added
                return done()
              })
          })
      })

      return it('should clear a related models cache on update', (done) => {
        const app = APP_FACTORY()
        const cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        const related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const { id } = MODELS_JSON[1]
        const related_id = RELATED_MODELS_JSON[1].id
        const attributes = _.clone(MODELS_JSON[1])
        attributes.name = `${attributes.name}_${_.uniqueId('name')}`
        const queue = new Queue(1)

        queue.defer(callback =>
          request(app)
            .get(`${RELATED_ROUTE}/${related_id}`)
            .end((err, res) => {
              console.log(err, res.body)
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return callback()
            }),
        )

        queue.defer(callback =>
          request(app)
            .put(`${ROUTE}/${attributes.id}`)
            .send(attributes)
            .end((err, res) => {
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return Related.destroy({id: related_id}, callback)
            }),
        )

        queue.defer(callback =>
          Related.exists({id: related_id}, (err, exists) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.ok(!exists, `related model doesn't exist in db: ${exists}`)

            return request(app)
              .get(`${RELATED_ROUTE}/${related_id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 404, `status 404 on subsequent request. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                return callback()
              })
          }),
        )

        return queue.await(done)
      })
    })

    //#####################################
    // delete
    //#####################################

    return describe('delete', () => {
      it('should delete an existing model', (done) => {
        const app = APP_FACTORY()
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const { id } = MODELS_JSON[1]

        return request(app)
          .get(`${ROUTE}/${id}`)
          .end((err, res) => {
            console.log(err, res.body)
            assert.ok(!err, `no errors: ${err}`)
            assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)

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
      })

      return it('should clear a related models cache on delete', (done) => {
        const app = APP_FACTORY()
        const cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        const related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        const { id } = MODELS_JSON[1]
        const related_id = RELATED_MODELS_JSON[1].id
        const queue = new Queue(1)

        queue.defer(callback =>
          request(app)
            .get(`${RELATED_ROUTE}/${related_id}`)
            .end((err, res) => {
              console.log(err, res.body)
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return callback()
            }),
        )

        queue.defer(callback =>
          request(app)
            .del(`${ROUTE}/${id}`)
            .end((err, res) => {
              assert.ok(!err, `no errors: ${err}`)
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
              return Related.destroy({id: related_id}, callback)
            }),
        )

        queue.defer(callback =>
          Related.exists({id: related_id}, (err, exists) => {
            assert.ok(!err, `no errors: ${err}`)
            assert.ok(!exists, `related model doesn't exist in db: ${exists}`)

            return request(app)
              .get(`${RELATED_ROUTE}/${related_id}`)
              .end((err, res) => {
                assert.ok(!err, `no errors: ${err}`)
                assert.equal(res.status, 404, `status 404 on subsequent request. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`)
                return callback()
              })
          }),
        )

        return queue.await(done)
      })
    })
  })
}),
)

