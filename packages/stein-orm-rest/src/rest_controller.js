/* eslint-disable
    constructor-super,
    func-names,
    guard-for-in,
    import/no-unresolved,
    new-cap,
    no-cond-assign,
    no-constant-condition,
    no-empty,
    no-eval,
    no-this-before-super,
    no-undef,
    no-unused-vars,
    no-use-before-define,
    no-var,
    prefer-rest-params,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  backbone-rest.js 0.5.3
  Copyright (c) 2013 Vidigami - https://github.com/vidigami/backbone-rest
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/

let RESTController
const path = require('path')
const {_, Backbone, Utils, JSONUtils} = require('backbone-orm')
const Queue = require('queue-async')

const JoinTableControllerSingleton = require('./lib/join_table_controller_singleton')

module.exports = (RESTController = (function() {
  RESTController = class RESTController extends (require('./lib/json_controller')) {
    static initClass() {
      this.METHODS = ['show', 'index', 'create', 'update', 'destroy', 'destroyByQuery', 'head', 'headByQuery']
    }

    constructor(app, options) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super() }
        const thisFn = (() => { return this }).toString()
        const thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim()
        eval(`${thisName} = this;`)
      }
      this.requestId = this.requestId.bind(this)
      this.index = this.index.bind(this)
      this.show = this.show.bind(this)
      this.create = this.create.bind(this)
      this.update = this.update.bind(this)
      this.destroy = this.destroy.bind(this)
      this.destroyByQuery = this.destroyByQuery.bind(this)
      this.head = this.head.bind(this)
      this.headByQuery = this.headByQuery.bind(this)
      this.clearCache = this.clearCache.bind(this)
      this.fetchIndexJSON = this.fetchIndexJSON.bind(this)
      this.fetchShowJSON = this.fetchShowJSON.bind(this)
      this.fetchJSON = this.fetchJSON.bind(this)
      this.render = this.render.bind(this)
      this.parseSearchQuery = this.parseSearchQuery.bind(this)
      this.clean = this.clean.bind(this)
      if (options == null) { options = {} }
      super(app, _.defaults({headers: RESTController.headers}, options))
      if (!this.whitelist) { this.whitelist = {} } if (!this.templates) { this.templates = {} }
      if (this.route_prefix) { this.route = path.join(this.route_prefix, this.route) }

      app.get(this.route, this.wrap(this.index))
      app.get(`${this.route}/:id`, this.wrap(this.show))

      app.post(this.route, this.wrap(this.create))
      app.put(`${this.route}/:id`, this.wrap(this.update))

      const del = app.hasOwnProperty('delete') ? 'delete' : 'del'
      app[del](`${this.route}/:id`, this.wrap(this.destroy))
      app[del](this.route, this.wrap(this.destroyByQuery))

      app.head(`${this.route}/:id`, this.wrap(this.head))
      app.head(this.route, this.wrap(this.headByQuery))

      this.db = (_.result(new this.model_type(), 'url') || '').split(':')[0]

      if (_.isUndefined(this.templates.show)) {
        const { schema } = this.model_type.prototype.sync('sync')
        const schemaKeys = _.keys(schema.type_overrides).concat(_.keys(schema.fields))
        this.templates.show = {$select: schemaKeys}
      }
      if (_.isUndefined(this.templates.show)) { this.default_template = 'show' }

      if (this.cache) {
        this.cache = _.pick(this.cache, 'cache', 'hash', 'createHash', 'cascade')
        if (this.cache.createHash && !this.cache.hash) {
          this.cache.hash = this.cache.createHash(this)
        }
        else if (!this.cache.hash) { this.cache.hash = this.route }
      }
      JoinTableControllerSingleton.generateByOptions(app, options)
    }

    requestId(req) { return JSONUtils.parseField(req.params.id, this.model_type, 'id') }

    index(req, res) {
      let cache
      if (req.method === 'HEAD') { return this.headByQuery.apply(this, arguments) } // Express4

      const done = (err, result) => {
        if (this.verbose) { console.timeEnd(`index_${this.route}`) }
        if (err) { return this.sendError(res, err) }
        const {json, status} = result
        if (status) { return this.sendStatus(res, status) }
        return res.json(json)
      }

      if (this.verbose) { console.time(`index_${this.route}`) }
      if (cache = this.cache != null ? this.cache.cache : undefined) {
        const key = `${this.cache.hash}|index_${JSON.stringify(req.query)}`
        return cache.wrap(key, (callback => this.fetchIndexJSON(req, callback)), this.cache, done)
      }
      return this.fetchIndexJSON(req, done)

    }

    show(req, res) {
      let cache
      const done = (err, result) => {
        if (this.verbose) { console.timeEnd(`show_${this.route}`) }
        if (err) { return this.sendError(res, err) }
        const {json, status} = result
        if (status) { return this.sendStatus(res, status) }
        return res.json(json)
      }

      req.query.id = this.requestId(req)
      req.query.$one = true

      if (this.verbose) { console.time(`show_${this.route}`) }
      if (cache = this.cache != null ? this.cache.cache : undefined) {
        const key = `${this.cache.hash}|show_${JSON.stringify(req.query)}`
        return cache.wrap(key, (callback => this.fetchShowJSON(req, callback)), this.cache, done)
      }
      return this.fetchShowJSON(req, done)

    }

    create(req, res) {
      let json = JSONUtils.parseDates(this.whitelist.create ? _.pick(req.body, this.whitelist.create) : req.body)
      const model = new this.model_type(this.model_type.prototype.parse(json))

      const event_data = {req, res, model}
      this.constructor.trigger('pre:create', event_data)

      return model.save(err => {
        if (err) { return this.sendError(res, err) }
        this.clearCache()

        event_data.model = model
        json = this.whitelist.create ? _.pick(model.toJSON(), this.whitelist.create) : model.toJSON()
        return this.render(req, json, (err, json) => {
          if (err) { return this.sendError(res, err) }
          this.constructor.trigger('post:create', _.extend(event_data, {json}))
          return res.json(json)
        })
      })
    }

    update(req, res) {
      let json = JSONUtils.parseDates(this.whitelist.update ? _.pick(req.body, this.whitelist.update) : req.body)

      return this.model_type.find(this.requestId(req), (err, model) => {
        if (err) { return this.sendError(res, err) }
        if (!model) { return this.sendStatus(res, 404) }

        const event_data = {req, res, model}
        this.constructor.trigger('pre:update', event_data)

        return model.save(model.parse(json), err => {
          if (err) { return this.sendError(res, err) }
          this.clearCache()

          event_data.model = model
          json = this.whitelist.update ? _.pick(model.toJSON(), this.whitelist.update) : model.toJSON()
          return this.render(req, json, (err, json) => {
            if (err) { return this.sendError(res, err) }
            this.constructor.trigger('post:update', _.extend(event_data, {json}))
            return res.json(json)
          })
        })
      })
    }

    destroy(req, res) {
      let id
      const event_data = {req, res}
      this.constructor.trigger('pre:destroy', event_data)

      return this.model_type.exists((id = this.requestId(req)), (err, exists) => {
        if (err) { return this.sendError(res, err) }
        if (!exists) { return this.sendStatus(res, 404) }

        return this.model_type.destroy(id, err => {
          if (err) { return this.sendError(res, err) }
          this.clearCache()
          this.constructor.trigger('post:destroy', event_data)
          return res.json({})
        })
      })
    }

    destroyByQuery(req, res) {
      const event_data = {req, res}
      this.constructor.trigger('pre:destroyByQuery', event_data)
      return this.model_type.destroy(JSONUtils.parseQuery(req.query), err => {
        if (err) { return this.sendError(res, err) }
        this.clearCache()
        this.constructor.trigger('post:destroyByQuery', event_data)
        return res.json({})
      })
    }

    head(req, res) {
      return this.model_type.exists(this.requestId(req), (err, exists) => {
        if (err) { return this.sendError(res, err) }
        return this.sendStatus(res, exists ? 200 : 404)
      })
    }

    headByQuery(req, res) {
      return this.model_type.exists(JSONUtils.parseQuery(req.query), (err, exists) => {
        if (err) { return this.sendError(res, err) }
        return this.sendStatus(res, exists ? 200 : 404)
      })
    }

    clearCache(callback) {
      let cache
      if (!callback) { callback = () => {} }
      if (!(cache = this.cache != null ? this.cache.cache : undefined)) { return callback() }
      if (!cache.store.hreset) {
        if (cache.reset) { return cache.reset(callback) }
        return callback()
      }

      const queue = new Queue()
      const hash_keys = [this.cache.hash].concat(Array.from(this.cache.cascade || []))
      console.log('clearCache keys', hash_keys)

      for (const hash_key of Array.from(hash_keys)) {
        (hash_key => queue.defer(callback => cache.store.hreset(hash_key, callback)))(hash_key)
      }

      return queue.await(err => {
        if (err) { console.log(`[${this.model_type.name} controller] Error clearing cache: `, err) }
        if (callback) { return callback(err) }
      })
    }

    fetchIndexJSON(req, callback) { return this.fetchJSON(req, this.whitelist.index, callback) }
    fetchShowJSON(req, callback) { return this.fetchJSON(req, this.whitelist.show, callback) }

    fetchJSON(req, whitelist, callback) {
      const key = `fetchJSON_${this.route}`
      if (this.verbose) { console.time(key) }

      const query = this.parseSearchQuery(JSONUtils.parseQuery(req.query))
      let cursor = this.model_type.cursor(query)
      if (whitelist) { cursor = cursor.whiteList(whitelist) }

      return cursor.toJSON((err, json) => {
        if (this.verbose) { console.timeEnd(key) }
        if (err) { return callback(err) }

        if (cursor.hasCursorQuery('$count') || cursor.hasCursorQuery('$exists')) { return callback(null, {json: {result: json}}) }

        if (!json) {
          if (cursor.hasCursorQuery('$one')) {
            return callback(null, {status: 404})
          }
          return callback(null, {json})

        }

        if (cursor.hasCursorQuery('$page')) {
          return this.render(req, json.rows, (err, rendered_json) => {
            if (err) { return this.sendError(res, err) }
            json.rows = rendered_json
            return callback(null, {json})
          })
        }
        else if (cursor.hasCursorQuery('$values')) {
          return callback(null, {json})
        }
        return this.render(req, json, (err, rendered_json) => callback(err, {json: rendered_json}))

      })
    }

    render(req, json, callback) {
      let template
      const done = (err, rendered_json) => {
        if (this.verbose) { console.timeEnd(key) }
        if (err) { return callback(err) }
        return callback(null, this.clean(rendered_json))
      }

      let template_name = req.query.$render || req.query.$template || this.default_template
      var key = `render_${template_name}_${this.route}`
      if (this.verbose) { console.time(key) }
      if (!template_name) { return done(null, json) }
      try { template_name = JSON.parse(template_name) }
      catch (error) {} // remove double quotes
      if (!(template = this.templates[template_name])) { return callback(new Error(`Unrecognized template: ${template_name}`)) }

      const options = (this.renderOptions ? this.renderOptions(req, template_name) : {})

      if (template.$raw) {
        return template(json, options, done)
      }

      const models = _.isArray(json) ? _.map(json, model_json => new this.model_type(this.model_type.prototype.parse(model_json))) : new this.model_type(this.model_type.prototype.parse(json))
      return JSONUtils.renderTemplate(models, template, options, done)
    }

    parseSearchQuery(query) {
      const new_query = {}
      if (!_.isObject(query) || !!(query instanceof Date)) { return query }

      for (const key in query) {
        const value = query[key]
        if (key === '$search') {
          if (this.db === 'mongodb') {
            new_query.$regex = value
            new_query.$options = 'i'
          }
          else {
            new_query.$like = value
          }

        }
        else if (_.isArray(value)) {
          new_query[key] = (Array.from(value).map((item) => this.parseSearchQuery(item)))
        }
        else if (_.isObject(value)) {
          new_query[key] = this.parseSearchQuery(value)
        }
        else {
          new_query[key] = value
        }
      }
      return new_query
    }

    clean(obj) {
      if (_.isArray(obj)) { return (Array.from(obj).map((o) => this.clean(o))) }
      if (!_.isObject(obj) || !!(obj instanceof Date)) { return obj }

      const final_obj = {}
      for (const key in obj) {
        const value = obj[key]
        if ((key !== '_rev') && !(_.isUndefined(value) || _.isNull(value))) {
          final_obj[key] = this.clean(value)
        }
      }
      return final_obj
    }
  }
  RESTController.initClass()
  return RESTController
}()))
