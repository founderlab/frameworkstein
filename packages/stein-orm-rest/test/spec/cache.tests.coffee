util = require 'util'
assert = require 'assert'
Queue = require 'queue-async'
cacheManager = require 'cache-manager'
redisStore = require 'fl-cache-manager-redis'
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
  RELATED_MODELS_JSON = null
  ROUTE = '/test/flats'
  RELATED_ROUTE = '/test/related'

  CACHE_OPTIONS = {
    cache: cacheManager.caching({
      store: redisStore
      hashFromKey: (key) => key.split('|')[0]
    })
    ttl: 100000
  }

  Related = null

  describe "RestController (sorted: false, #{options.$tags}, framework: #{options.app_framework.name})", ->
    Flat = null
    before ->
      BackboneORM.configure {model_cache: {enabled: !!options.cache, max: 100}}

      class Flat extends Backbone.Model
        urlRoot: "#{DATABASE_URL}/flats"
        schema: _.defaults({
          boolean: 'Boolean'
        }, BASE_SCHEMA)
        sync: SYNC(Flat, options.cache)

      class Related extends Backbone.Model
        urlRoot: "#{DATABASE_URL}/relateds"
        schema: _.defaults({
          boolean: 'Boolean'
          flat: ['belongsTo', Flat]
        }, BASE_SCHEMA)
        sync: SYNC(Related, options.cache)

    after (callback) -> Utils.resetSchemas [Flat], callback

    beforeEach (callback) ->
      Utils.resetSchemas [Flat, Related], (err) ->
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

            Fabricator.create Related, BASE_COUNT, {
              name: Fabricator.uniqueId('rel_')
              created_at: Fabricator.date
              updated_at: Fabricator.date
            }, (err, models) ->
              return callback(err) if err

              Related.find {$ids: _.pluck(models, 'id')}, (err, models) -> # reload models in case they are stored with different date precision
                return callback(err) if err
                RELATED_MODELS_JSON = JSONUtils.parse(sortO(_.map(models, (test) -> test.toJSON()), 'name')) # need to sort because not sure what order will come back from database
                callback()

    ######################################
    # index
    ######################################

    describe 'index', ->

      it 'should return json for all models with no query', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        request(app)
          .get(ROUTE)
          .type('json')
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = MODELS_JSON, actual = sortO(JSONUtils.parse(res.body), 'name'), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

    ######################################
    # show
    ######################################

    describe 'show', ->
      it 'should find an existing model', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        request(app)
          .get("#{ROUTE}/#{MODELS_JSON[0].id}")
          .type('json')
          .end (err, res) ->
            console.dir(res.body, {depth: null, colors: true})
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(expected = MODELS_JSON[0], actual = JSONUtils.parse(res.body), "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
            done()

    ######################################
    # create
    ######################################

    describe 'create', ->
      it 'should create a new model and assign an id', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        attributes = {name: _.uniqueId('name_'), created_at: (new Date).toISOString(), updated_at: (new Date).toISOString()}
        request(app)
          .post(ROUTE)
          .send(attributes)
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.ok(!!res.body.id, 'assigned an id')
            assert.equal(attributes.name, res.body.name, 'name matches')

            request(app)
              .get(ROUTE)
              .type('json')
              .end (err, res) ->
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                assert.equal(expected = MODELS_JSON.length+1, actual = res.body.length, "Expected: #{JSONUtils.stringify(expected)}. Actual: #{JSONUtils.stringify(actual)}")
                done()

      it 'should clear a related models cache on create', (done) ->
        app = APP_FACTORY()
        cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        id = MODELS_JSON[1].id
        related_id = RELATED_MODELS_JSON[1].id
        attributes = {name: _.uniqueId('name_'), created_at: (new Date).toISOString(), updated_at: (new Date).toISOString()}
        queue = new Queue(1)

        queue.defer (callback) ->
          request(app)
            .get("#{RELATED_ROUTE}/#{related_id}")
            .end (err, res) ->
              console.log(err, res.body)
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              callback()

        queue.defer (callback) ->
          request(app)
            .post(ROUTE)
            .send(attributes)
            .end (err, res) ->
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              Related.destroy {id: related_id}, callback

        queue.defer (callback) ->
          Related.exists {id: related_id}, (err, exists) ->
            assert.ok(!err, "no errors: #{err}")
            assert.ok(!exists, "related model doesn't exist in db: #{exists}")

            request(app)
              .get("#{RELATED_ROUTE}/#{related_id}")
              .end (err, res) ->
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 404, "status 404 on subsequent request. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                callback()

        queue.await done

    ######################################
    # update
    ######################################

    describe 'update', ->
      it 'should update an existing model', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        attributes = _.clone(MODELS_JSON[1])
        attributes.name = "#{attributes.name}_#{_.uniqueId('name')}"
        request(app)
          .put("#{ROUTE}/#{attributes.id}")
          .send(attributes)
          .end (err, res) ->
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
            assert.deepEqual(_.omit(attributes, '_rev'), _.omit(JSONUtils.parse(res.body), '_rev'), 'model was updated') # there could be _rev added

            request(app)
              .get("#{ROUTE}/#{attributes.id}")
              .type('json')
              .end (err, res) ->
                console.dir(res.body, {depth: null, colors: true})
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                assert.deepEqual(_.omit(attributes, '_rev'), _.omit(JSONUtils.parse(res.body), '_rev'), 'model was updated') # there could be _rev added
                done()

      it 'should clear a related models cache on update', (done) ->
        app = APP_FACTORY()
        cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        id = MODELS_JSON[1].id
        related_id = RELATED_MODELS_JSON[1].id
        attributes = _.clone(MODELS_JSON[1])
        attributes.name = "#{attributes.name}_#{_.uniqueId('name')}"
        queue = new Queue(1)

        queue.defer (callback) ->
          request(app)
            .get("#{RELATED_ROUTE}/#{related_id}")
            .end (err, res) ->
              console.log(err, res.body)
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              callback()

        queue.defer (callback) ->
          request(app)
            .put("#{ROUTE}/#{attributes.id}")
            .send(attributes)
            .end (err, res) ->
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              Related.destroy {id: related_id}, callback

        queue.defer (callback) ->
          Related.exists {id: related_id}, (err, exists) ->
            assert.ok(!err, "no errors: #{err}")
            assert.ok(!exists, "related model doesn't exist in db: #{exists}")

            request(app)
              .get("#{RELATED_ROUTE}/#{related_id}")
              .end (err, res) ->
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 404, "status 404 on subsequent request. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                callback()

        queue.await done

    ######################################
    # delete
    ######################################

    describe 'delete', ->
      it 'should delete an existing model', (done) ->
        app = APP_FACTORY()
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: CACHE_OPTIONS})

        id = MODELS_JSON[1].id

        request(app)
          .get("#{ROUTE}/#{id}")
          .end (err, res) ->
            console.log(err, res.body)
            assert.ok(!err, "no errors: #{err}")
            assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")

            request(app)
              .del("#{ROUTE}/#{id}")
              .end (err, res) ->
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")

                request(app)
                  .get("#{ROUTE}/#{id}")
                  .end (err, res) ->
                    assert.ok(!err, "no errors: #{err}")
                    assert.equal(res.status, 404, "status 404 on subsequent request. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                    done()

      it 'should clear a related models cache on delete', (done) ->
        app = APP_FACTORY()
        cache_options = _.extend({}, CACHE_OPTIONS, {cascade: [RELATED_ROUTE]})
        controller = new RestController(app, {model_type: Flat, route: ROUTE, default_template: null, cache: cache_options})
        related_controller = new RestController(app, {model_type: Related, route: RELATED_ROUTE, default_template: null, cache: CACHE_OPTIONS})

        id = MODELS_JSON[1].id
        related_id = RELATED_MODELS_JSON[1].id
        queue = new Queue(1)

        queue.defer (callback) ->
          request(app)
            .get("#{RELATED_ROUTE}/#{related_id}")
            .end (err, res) ->
              console.log(err, res.body)
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              callback()

        queue.defer (callback) ->
          request(app)
            .del("#{ROUTE}/#{id}")
            .end (err, res) ->
              assert.ok(!err, "no errors: #{err}")
              assert.equal(res.status, 200, "status not 200. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
              Related.destroy {id: related_id}, callback

        queue.defer (callback) ->
          Related.exists {id: related_id}, (err, exists) ->
            assert.ok(!err, "no errors: #{err}")
            assert.ok(!exists, "related model doesn't exist in db: #{exists}")

            request(app)
              .get("#{RELATED_ROUTE}/#{related_id}")
              .end (err, res) ->
                assert.ok(!err, "no errors: #{err}")
                assert.equal(res.status, 404, "status 404 on subsequent request. Status: #{res.status}. Body: #{JSONUtils.stringify(res.body)}")
                callback()

        queue.await done

