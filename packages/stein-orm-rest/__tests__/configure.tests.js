/* eslint-disable
    func-names,
    import/no-unresolved,
    no-undef,
    no-unused-vars,
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

const RestController = require('../../lib/rest_controller')

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

  return describe(`RestController (blocked: true, ${options.$tags}, framework: ${options.app_framework.name})`, () => {
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

    it('Blocking routes: index', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['index']})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: show', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['show']})

      return request(app)
        .get(`${ROUTE}/1`)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: create', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['create']})

      return request(app)
        .post(ROUTE)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: update', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['update']})

      return request(app)
        .put(`${ROUTE}/1`)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: destroy', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['destroy']})

      return request(app)
        .del(`${ROUTE}/1`)
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: destroyByQuery', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['destroyByQuery']})

      return request(app)
        .del(ROUTE)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: head', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['head']})

      return request(app)
        .head(`${ROUTE}/1`)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('Blocking routes: headByQuery', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['headByQuery']})

      return request(app)
        .head(ROUTE)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)
          return done()
        })
    })

    it('configure headers', (done) => {
      const app = APP_FACTORY()
      const headers = _.clone(RestController.headers)
      RestController.configure({headers: _.extend({ETag: '1234'}, headers)})
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['headByQuery']})

      return request(app)
        .head(ROUTE)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)

          assert.equal(res.headers.etag, '1234', 'ETag header was returned')

          assert.equal(RestController.headers.ETag, '1234', 'ETag header was set')
          RestController.configure({headers})
          assert.ok(_.isUndefined(RestController.headers.ETag), 'ETag header was removed')

          return done()
        })
    })

    return it('configure headers', (done) => {
      const app = APP_FACTORY()
      const controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, blocked: ['headByQuery']})
      controller.configure({headers: _.extend({ETag: '1234'}, controller.headers)})

      return request(app)
        .head(ROUTE)
        .send({stuff: 100})
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(405, res.status, `Expected: ${405}, Actual: ${res.status}`)

          assert.equal(res.headers.etag, '1234', 'ETag header was returned')
          assert.equal(controller.headers.ETag, '1234', 'ETag header was set')

          assert.ok(_.isUndefined(RestController.headers.ETag), 'ETag header was removed')
          controller.configure({headers: RestController.headers})
          assert.ok(_.isUndefined(controller.headers.ETag), 'ETag header was removed')

          return done()
        })
    })
  })
}),
)
