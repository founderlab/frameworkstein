util = require 'util'
assert = require 'assert'

BackboneORM = require 'backbone-orm'
{_, Backbone, Queue, Utils, JSONUtils, Fabricator} = BackboneORM

request = require 'supertest'

RestController = require '../../lib/index'

sortO = (array, field) -> _.sortBy(array, (obj) -> JSON.stringify(obj[field]))
sortA = (array) -> _.sortBy(array, (item) -> JSON.stringify(item))

_.each BackboneORM.TestUtils.optionSets(), exports = (options) ->
  options = _.extend({}, options, __test__parameters) if __test__parameters?
  options.app_framework = __test__app_framework if __test__app_framework?
  return if options.embed and not options.sync.capabilities(options.database_url or '').embed

  DATABASE_URL = options.database_url or ''
  BASE_SCHEMA = options.schema or {}
  SYNC = options.sync
  BASE_COUNT = 5

  APP_FACTORY = options.app_framework.factory
  MODELS_JSON = null
  ROUTE = '/test/flats'

  describe "RestController (sorted: true, #{options.$tags}, framework: #{options.app_framework.name})", ->
    Flat = null
    before ->
      BackboneORM.configure {model_cache: {enabled: !!options.cache, max: 100}}

      class Flat extends Backbone.Model
        urlRoot: "#{DATABASE_URL}/flats"
        schema: _.defaults({
          boolean: 'Boolean'
        }, BASE_SCHEMA)
        sync: SYNC(Flat, options.cache)

    after (callback) -> Utils.resetSchemas [Flat], callback

    beforeEach (callback) ->
      Utils.resetSchemas [Flat], (err) ->
        return callback(err) if err

        Fabricator.create Flat, BASE_COUNT, {
          name: Fabricator.uniqueId('flat_')
          created_at: Fabricator.date
          updated_at: Fabricator.date
        }, (err, models) ->
          return callback(err) if err

          Flat.find {$ids: _.pluck(models, 'id')}, (err, models) -> # reload models in case they are stored with different date precision
            return callback(err) if err
            MODELS_JSON = JSONUtils.parse(sortO(_.map(models, (test) -> test.toJSON()), 'name')) # need to sort because not sure what order will come back from database
            callback()

    ######################################
    # index
    ######################################

    describe 'index', ->
      it 'should return json for all models with no query', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = MODELS_JSON, actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by single key', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name', $select: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> _.pick(item, 'name')), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by single key respecting whitelist (key included)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> _.pick(item, 'name')), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by single key respecting whitelist (key excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> []), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by an array of keys', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> _.pick(item, ['name', 'created_at'])), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by an array of keys respecting whitelist (keys included)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at', 'updated_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> _.pick(item, ['name', 'created_at'])), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by an array of keys respecting whitelist (key excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at', 'updated_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'created_at',  $select: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortO(_.map(MODELS_JSON, (item) -> _.pick(item, ['created_at'])), 'created_at'), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested keys by an array of keys respecting whitelist (keys excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $select: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = _.map(MODELS_JSON, (item) -> {}), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by single key', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> item['name'])), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by single key (in array)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> item['name'])), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by single key respecting whitelist (key included)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> item['name'])), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by single key respecting whitelist (key excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'created_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: 'name'}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> null)), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by an array of keys', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> _.values(_.pick(item, ['name', 'created_at'])))), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by an array of keys respecting whitelist (keys included)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name', 'created_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> _.values(_.pick(item, ['name', 'created_at'])))), actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by an array of keys respecting whitelist (key excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'name']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> _.values(_.pick(item, ['name'])))), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

      it 'should select requested values by an array of keys respecting whitelist (keys excluded)', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, whitelist: {index: ['id', 'updated_at']}})

        request(app)
          .get(ROUTE)
          .query(JSONUtils.querify({$sort: 'name',  $values: ['name', 'created_at']}))
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = sortA(_.map(MODELS_JSON, (item) -> [])), actual = res.body, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()
