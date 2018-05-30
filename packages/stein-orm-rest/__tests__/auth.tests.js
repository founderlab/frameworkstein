/* eslint-disable
    func-names,
    import/no-unresolved,
    no-plusplus,
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
const { _, Backbone, Queue, Utils, JSONUtils, Fabricator } = BackboneORM

const request = require('supertest')

const RestController = require('../../lib/rest_controller')

const sortO = (array, field) => _.sortBy(array, obj => JSON.stringify(obj[field]))
const sortA = array => _.sortBy(array, item => JSON.stringify(item))

_.each([BackboneORM.TestUtils.optionSets()[0]], (exports = function(options) {
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

  return describe(`RestController (blocked: true, ${options.$tags}, framework: ${options.app_framework.name}) @auth`, () => {
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
            MODELS_JSON = JSONUtils.parseDates(sortO(_.map(models, test => test.toJSON()), 'name')) // need to sort because not sure what order will come back from database
            return callback()
          })
        })
      }),
    )

    it('Function auth (pass through)', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 1, `Correct counts. Expected: ${1}. Actual: ${count}`)
          return done()
        })
    })

    it('Function auth (405)', (done) => {
      let count = 0
      const auth405 = function(req, res, next) { count++; res.status(405); return res.json({}) }

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auth405})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.status, 405, `Expected: ${405}, Actual: ${res.status}`)
          assert.equal(count, 1, `Correct counts. Expected: ${1}. Actual: ${count}`)
          return done()
        })
    })

    it('Function auths (pass through)', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths = [auth, auth]

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 2, `Correct counts. Expected: ${2}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (pass through) - none', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths = {}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 0, `Correct counts. Expected: ${0}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (pass through) - default', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths =
        {default: auth}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 1, `Correct counts. Expected: ${1}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (pass through) - defaults', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths =
        {default: [auth, auth]}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 2, `Correct counts. Expected: ${2}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (pass through) - index', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths =
        {index: auth}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 1, `Correct counts. Expected: ${1}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (pass through) - indexs', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths =
        {index: [auth, auth]}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 2, `Correct counts. Expected: ${2}. Actual: ${count}`)
          return done()
        })
    })

    it('Object auths (405) - indexs', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auth405 = function(req, res, next) { count++; res.status(405); return res.json({}) }
      const auths =
        {index: [auth, auth405]}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.status, 405, `Expected: ${405}, Actual: ${res.status}`)
          assert.equal(count, 2, `Correct counts. Expected: ${2}. Actual: ${count}`)
          return done()
        })
    })

    return it('Object auths (pass through) - show', (done) => {
      let count = 0
      const auth = function(req, res, next) { count++; return next() }
      const auths =
        {show: auth}

      const app = APP_FACTORY()
      const controller = new RestController(app, {modelType: Flat, route: ROUTE, default_template: null, auth: auths})

      return request(app)
        .get(ROUTE)
        .type('json')
        .end((err, res) => {
          assert.ok(!err, `No errors: ${err}`)
          assert.equal(res.body.length, BASE_COUNT, `Expected: ${BASE_COUNT}, Actual: ${res.body.length}`)
          assert.equal(count, 0, `Correct counts. Expected: ${0}. Actual: ${count}`)
          return done()
        })
    })
  })
}),
)
