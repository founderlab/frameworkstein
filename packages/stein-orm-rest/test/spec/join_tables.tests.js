/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let exports;
const util = require('util');
const assert = require('assert');

const BackboneORM = require('backbone-orm');
const {_, Backbone, Queue, Utils, JSONUtils, Fabricator} = BackboneORM;

const request = require('supertest');

const RestController = require('../../lib/index');

const sortO = (array, field) => _.sortBy(array, obj => JSON.stringify(obj[field]));
const sortA = array => _.sortBy(array, item => JSON.stringify(item));

_.each(BackboneORM.TestUtils.optionSets(), (exports = function(options) {
  if (typeof __test__parameters !== 'undefined' && __test__parameters !== null) { options = _.extend({}, options, __test__parameters); }
  if (typeof __test__app_framework !== 'undefined' && __test__app_framework !== null) { options.app_framework = __test__app_framework; }
  if (options.embed && !options.sync.capabilities(options.database_url || '').embed) { return; }

  const DATABASE_URL = options.database_url || '';
  const BASE_SCHEMA = options.schema || {};
  const SYNC = options.sync;
  const BASE_COUNT = 5;

  const APP_FACTORY = options.app_framework.factory;
  let MODELS_JSON = null;
  const OWNER_ROUTE = '/test/owners';
  const JOIN_TABLE_ROUTE = '/test/owners_reverses';

  return describe(`Many to Many (${options.$tags}, framework: ${options.app_framework.name})`, function() {
    let mockApp, Owner;
    let Reverse = (Owner = (mockApp = null));
    before(function() {
      BackboneORM.configure({model_cache: {enabled: !!options.cache, max: 100}});

      Reverse = class Reverse extends Backbone.Model {
        static initClass() {
          this.prototype.urlRoot = `${DATABASE_URL}/reverses`;
          this.prototype.schema = _.defaults({
            owners() { return ['hasMany', Owner]; }
          }, BASE_SCHEMA);
          this.prototype.sync = SYNC(Reverse);
        }
      };
      Reverse.initClass();

      Owner = class Owner extends Backbone.Model {
        static initClass() {
          this.prototype.urlRoot = `${DATABASE_URL}/owners`;
          this.prototype.schema = _.defaults({
            reverses() { return ['hasMany', Reverse]; }
          }, BASE_SCHEMA);
          this.prototype.sync = SYNC(Owner);
        }
      };
      Owner.initClass();

      return mockApp = function() {
        const app = APP_FACTORY();
        new RestController(app, {model_type: Owner, route: OWNER_ROUTE}); // this should auto-generated the join table controller and route
        return app;
      };
    });

    after(callback => Utils.resetSchemas([Reverse, Owner], callback));

    beforeEach(function(callback) {
      require('../../lib/lib/join_table_controller_singleton').reset(); // reset join tables
      const MODELS = {};

      const queue = new Queue(1);
      queue.defer(callback => Utils.resetSchemas([Reverse, Owner], callback));
      queue.defer(function(callback) {
        const create_queue = new Queue();

        create_queue.defer(callback => Fabricator.create(Reverse, 2*BASE_COUNT, {
          name: Fabricator.uniqueId('reverses_'),
          created_at: Fabricator.date
        }, function(err, models) { MODELS.reverse = models; return callback(err); })
         );
        create_queue.defer(callback => Fabricator.create(Owner, BASE_COUNT, {
          name: Fabricator.uniqueId('owners_'),
          created_at: Fabricator.date
        }, function(err, models) { MODELS.owner = models; return callback(err); })
         );

        return create_queue.await(callback);
      });

      // link and save all
      queue.defer(function(callback) {
        MODELS_JSON = [];

        const save_queue = new Queue(1);

        for (let owner of Array.from(MODELS.owner)) {
          (owner => save_queue.defer(function(callback) {
            const reverses = [MODELS.reverse.pop(), MODELS.reverse.pop()];
            // console.log "linking #{owner.id} to #{reverses[0]?.id}, #{reverses[1]?.id}"
            owner.set({reverses});
            for (let reverse of Array.from(owner.get('reverses').models)) { MODELS_JSON.push({owner_id: owner.id, reverse_id: reverse.id}); } // save relations
            return owner.save(callback);
          }) )(owner);
        }

        return save_queue.await(callback);
      });

      return queue.await(callback);
    });

    it('Handles a get query for a hasMany and hasMany two sided relation', function(done) {
      const app = mockApp();
      return request(app)
        .get(OWNER_ROUTE)
        .query(JSONUtils.querify({$one: true}))
        .type('json')
        .end(function(err, res) {
          assert.ok(!err, `no errors: ${err}`);
          assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
          const owner_id = JSONUtils.parse(res.body).id;
          assert.ok(!!owner_id, 'found owner');

          return request(app)
            .get(JOIN_TABLE_ROUTE)
            .query(JSONUtils.querify({owner_id}))
            .type('json')
            .end(function(err, res) {
              assert.ok(!err, `no errors: ${err}`);
              assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
              let expected = sortO(_.select(MODELS_JSON, test => test.owner_id === owner_id), 'reverse_id');
              let actual = sortO(_.map(JSONUtils.parse(res.body), item => _.pick(item, 'owner_id', 'reverse_id')), 'reverse_id');
              assert.deepEqual(expected, actual, `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`);

              const { reverse_id } = actual[0];
              return request(app)
                .get(JOIN_TABLE_ROUTE)
                .query(JSONUtils.querify({reverse_id}))
                .type('json')
                .end(function(err, res) {
                  assert.ok(!err, `no errors: ${err}`);
                  assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
                  expected = sortO(_.select(MODELS_JSON, test => test.reverse_id === reverse_id), 'owner_id');
                  actual = sortO(_.map(JSONUtils.parse(res.body), item => _.pick(item, 'owner_id', 'reverse_id')), 'owner_id');
                  assert.deepEqual(expected, actual, `Expected: ${JSONUtils.stringify(expected)}. Actual: ${JSONUtils.stringify(actual)}`);
                  return done();
              });
          });
      });
    });

    // TODO: re-enable
    it.skip('Responds with a 409 when creating the same model twice', function(done) {
      const app = mockApp();

      const send_post = callback =>
        request(app)
          .post(JOIN_TABLE_ROUTE)
          .send({owner_id: 1, reverse_id: 1})
          .type('json')
          .end(callback)
      ;

      return send_post(function(err, res) {
        assert.ok(!err, `no errors: ${err}`);
        assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
        const { owner_id } = JSONUtils.parse(res.body);
        assert.ok(!!owner_id, "found owner_id");

        return send_post(function(err, res) {
          assert.ok(!err, `no errors: ${err}`);
          assert.equal(res.status, 409, `status not 409. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
          return done();
        });
      });
    });

    it.skip('Can include related (two-way hasMany) models', function(done) {
      const app = mockApp();
      request(app)
        .get(OWNER_ROUTE)
        .query(JSONUtils.querify({$one: true, $include: 'reverses'}))
        .type('json')
        .end(function(err, res) {
          assert.ok(!err, `no errors: ${err}`);
          assert.equal(res.status, 200, `status not 200. Status: ${res.status}. Body: ${JSONUtils.stringify(res.body)}`);
          const owner_id = JSONUtils.parse(res.body).id;
          return assert.ok(!!owner_id, 'found owner');
      });

      return Owner.cursor({$one: true}).include('reverses').toJSON(function(err, test_model) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(test_model, 'found model');
        assert.ok(test_model.reverses, 'Has related reverses');
        assert.equal(test_model.reverses.length, 2, `Has the correct number of related reverses \nExpected: ${2}\nActual: ${test_model.reverses.length}`);
        return done();
      });
    });

    it.skip('Can query on related (two-way hasMany) models', done =>
      Reverse.findOne(function(err, reverse) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(reverse, 'found model');
        return Owner.cursor({'reverses.name': reverse.get('name')}).toJSON(function(err, json) {
          const test_model = json[0];
          assert.ok(!err, `No errors: ${err}`);
          assert.ok(test_model, 'found model');
          assert.equal(json.length, 1, `Found the correct number of owners \nExpected: ${1}\nActual: ${json.length}`);
          return done();
        });
      })
    );

    it.skip('Can query on related (two-way hasMany) models with included relations', done =>
      Reverse.findOne(function(err, reverse) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(reverse, 'found model');
        return Owner.cursor({'reverses.name': reverse.get('name')}).include('reverses').toJSON(function(err, json) {
          const test_model = json[0];
          assert.ok(!err, `No errors: ${err}`);
          assert.ok(test_model, 'found model');
          assert.ok(test_model.reverses, 'Has related reverses');
          assert.equal(test_model.reverses.length, 2, `Has the correct number of related reverses \nExpected: ${2}\nActual: ${test_model.reverses.length}`);
          return done();
        });
      })
    );

    it.skip('Clears its reverse relations on delete when the reverse relation is loaded', done =>
      Owner.cursor({$one: true, $include: 'reverses'}).toModels(function(err, owner) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(owner, 'found model');
        return owner.get('reverses', function(err, reverses) {
          assert.ok(!err, `No errors: ${err}`);
          assert.ok(reverses, 'found model');

          return owner.destroy(function(err, owner) {
            assert.ok(!err, `No errors: ${err}`);

            return Owner.relation('reverses').join_table.find({owner_id: owner.id}, function(err, null_reverses) {
              assert.ok(!err, `No errors: ${err}`);
              assert.equal(null_reverses.length, 0, 'No reverses found for this owner after save');
              return done();
            });
          });
        });
      })
    );

    it.skip('Clears its reverse relations on delete when the reverse relation isnt loaded (one-way hasMany)', done =>
      Owner.cursor({$one: true}).toModels(function(err, owner) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(owner, 'found model');
        return owner.get('reverses', function(err, reverses) {
          assert.ok(!err, `No errors: ${err}`);
          assert.ok(reverses, 'found model');

          return owner.destroy(function(err, owner) {
            assert.ok(!err, `No errors: ${err}`);

            return Owner.relation('reverses').join_table.find({owner_id: owner.id}, function(err, null_reverses) {
              assert.ok(!err, `No errors: ${err}`);
              assert.equal(null_reverses.length, 0, 'No reverses found for this owner after save');
              return done();
            });
          });
        });
      })
    );

    return it.skip('Can query on a ManyToMany relation by related id', done =>
      Owner.findOne(function(err, owner) {
        assert.ok(!err, `No errors: ${err}`);
        assert.ok(owner, 'found model');
        return Reverse.cursor({owner_id: owner.id}).toModels(function(err, reverses) {
          assert.ok(!err, `No errors: ${err}`);
          assert.ok(reverses, 'found models');
          assert.equal(reverses.length, 2, `Found the correct number of reverses\n expected: ${2}, actual: ${reverses.length}`);
          return done();
        });
      })
    );
  });
})
);
