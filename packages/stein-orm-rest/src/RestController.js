/* eslint-disable
    new-cap,
*/
import _ from 'lodash'
import path from 'path'
import Queue from 'queue-async'
import { parse, parseField, parseDates, parseQuery } from './lib/parsers'
import JsonController from './lib/JsonController'
import JoinTableControllerSingleton from './lib/JoinTableControllerSingleton'
import defaultTemplate from './lib/defaultTemplate'


export default class RESTController extends JsonController {

  constructor(app, options={}) {
    super(app, options)
    this.METHODS = ['show', 'index', 'create', 'update', 'destroy', 'destroyByQuery', 'head', 'headByQuery']

    if (!this.whitelist) this.whitelist = {}
    if (!this.templates) this.templates = {}
    if (this.routePrefix) this.route = path.join(this.routePrefix, this.route)

    app.get(this.route, this.wrap(this.index))
    app.get(`${this.route}/:id`, this.wrap(this.show))

    app.post(this.route, this.wrap(this.create))
    app.put(`${this.route}/:id`, this.wrap(this.update))

    const del = app.hasOwnProperty('delete') ? 'delete' : 'del'
    app[del](`${this.route}/:id`, this.wrap(this.destroy))
    app[del](this.route, this.wrap(this.destroyByQuery))

    app.head(`${this.route}/:id`, this.wrap(this.head))
    app.head(this.route, this.wrap(this.headByQuery))

    this.db = (_.result(new this.modelType(), 'url') || '').split(':')[0]

    if (_.isUndefined(this.templates.show)) {
      this.templates.show = defaultTemplate
    }
    if (!this.defaultTemplate) this.defaultTemplate = 'show'

    if (this.cache) {
      this.cache = _.pick(this.cache, 'cache', 'hash', 'createHash', 'cascade')
      if (this.cache.createHash && !this.cache.hash) {
        this.cache.hash = this.cache.createHash(this)
      }
      else if (!this.cache.hash) {
        this.cache.hash = this.route
      }
    }

    JoinTableControllerSingleton.generateByOptions(app, options)
  }

  requestId = (req) => parseField(req.params.id, this.modelType, 'id')

  index(req, res) {
    const cache = this.cache ? this.cache.cache : null
    if (req.method === 'HEAD') { return this.headByQuery.apply(this, arguments) } // Express4

    const done = (err, result) => {
      if (this.verbose) { console.timeEnd(`index_${this.route}`) }
      if (err) return this.sendError(res, err)
      const { json, status } = result
      if (status) { return this.sendStatus(res, status) }
      return res.json(json)
    }

    if (this.verbose) { console.time(`index_${this.route}`) }
    if (cache) {
      const key = `${this.cache.hash}|index_${JSON.stringify(req.query)}`
      return cache.wrap(key, (callback => this.fetchIndexJSON(req, callback)), this.cache, done)
    }

    return this.fetchIndexJSON(req, done)
  }

  show(req, res) {
    const cache = this.cache ? this.cache.cache : null

    const done = (err, result) => {
      if (this.verbose) { console.timeEnd(`show_${this.route}`) }
      if (err) return this.sendError(res, err)
      const { json, status } = result
      if (status) { return this.sendStatus(res, status) }
      return res.json(json)
    }

    req.query.id = this.requestId(req)
    req.query.$one = true

    if (this.verbose) { console.time(`show_${this.route}`) }
    if (cache) {
      const key = `${this.cache.hash}|show_${JSON.stringify(req.query)}`
      return cache.wrap(key, (callback => this.fetchShowJSON(req, callback)), this.cache, done)
    }

    return this.fetchShowJSON(req, done)
  }

  create(req, res) {
    let json = parseDates(this.whitelist.create ? _.pick(req.body, this.whitelist.create) : req.body)
    const model = new this.modelType(this.parse(json))

    return model.save(err => {
      if (err) return this.sendError(res, err)
      this.clearCache()

      json = this.whitelist.create ? _.pick(model.toJSON(), this.whitelist.create) : model.toJSON()

      return this.render(req, json, (err, json) => {
        if (err) return this.sendError(res, err)

        this.events.emit('create', {req, res, model, json})
        return res.json(json)
      })
    })
  }

  update(req, res) {
    let json = parseDates(this.whitelist.update ? _.pick(req.body, this.whitelist.update) : req.body)

    return this.modelType.find(this.requestId(req), (err, model) => {
      if (err) return this.sendError(res, err)
      if (!model) { return this.sendStatus(res, 404) }

      return model.save(this.parse(json), err => {
        if (err) return this.sendError(res, err)
        this.clearCache()

        json = this.whitelist.update ? _.pick(model.toJSON(), this.whitelist.update) : model.toJSON()

        return this.render(req, json, (err, json) => {
          if (err) return this.sendError(res, err)
          this.events.emit('update', {req, res, model, json})
          return res.json(json)
        })
      })
    })
  }

  destroy(req, res) {
    const id = this.requestId(req)

    return this.modelType.exists(id, (err, exists) => {
      if (err) return this.sendError(res, err)
      if (!exists) { return this.sendStatus(res, 404) }

      return this.modelType.destroy(id, err => {
        if (err) return this.sendError(res, err)
        this.clearCache()
        this.events.emit('destroy', {req, res, id})
        return res.json({})
      })
    })
  }

  destroyByQuery(req, res) {
    return this.modelType.destroy(parseQuery(req.query), err => {
      if (err) return this.sendError(res, err)
      this.clearCache()
      this.events.emit('destroyByQuery', {req, res})
      return res.json({})
    })
  }

  head(req, res) {
    return this.modelType.exists(this.requestId(req), (err, exists) => {
      if (err) return this.sendError(res, err)
      return this.sendStatus(res, exists ? 200 : 404)
    })
  }

  headByQuery(req, res) {
    return this.modelType.exists(parseQuery(req.query), (err, exists) => {
      if (err) return this.sendError(res, err)
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
    const hashKeys = [this.cache.hash].concat(this.cache.cascade || [])

    for (const hashKey of hashKeys) {
      (hashKey => queue.defer(callback => cache.store.hreset(hashKey, callback)))(hashKey)
    }

    return queue.await(err => {
      if (err) { console.log(`[${this.modelType.name} controller] Error clearing cache: `, err) }
      if (callback) callback(err)
    })
  }

  fetchIndexJSON(req, callback) { this.fetchJSON(req, this.whitelist.index, callback) }
  fetchShowJSON(req, callback) { this.fetchJSON(req, this.whitelist.show, callback) }

  fetchJSON(req, whitelist, callback) {
    const key = `fetchJSON_${this.route}`
    if (this.verbose) { console.time(key) }

    const query = this.parseSearchQuery(parseQuery(req.query))
    let cursor = this.modelType.cursor(query)
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
        return this.render(req, json.rows, (err, renderedJson) => {
          if (err) return callback(err)
          json.rows = renderedJson
          return callback(null, {json})
        })
      }
      else if (cursor.hasCursorQuery('$values')) {
        return callback(null, {json})
      }

      return this.render(req, json, (err, renderedJson) => callback(err, {json: renderedJson}))
    })
  }

  render(req, json, callback) {
    let templateName = req.query.$render || req.query.$template || this.defaultTemplate
    const key = `render_${templateName}_${this.route}`
    let single = false

    const done = (err, renderedJson) => {
      if (this.verbose) { console.timeEnd(key) }
      if (err) return callback(err)
      const cleanedJson = this.clean(renderedJson)
      return callback(null, single ? cleanedJson[0] : cleanedJson)
    }

    if (this.verbose) { console.time(key) }
    if (!templateName) { return done(null, json) }

    if (!_.isArray(json)) {
      single = true
      json = [json]
    }

    try {
      // remove double quotes
      templateName = JSON.parse(templateName)
    }
    catch (error) { }

    const template = this.templates[templateName]
    if (!template) return callback(new Error(`Unrecognized template: ${this.name} ${templateName}`))

    const options = (this.renderOptions ? this.renderOptions(req, templateName) : {})

    if (_.isFunction(template)) return template(json, options, done)
    else if (template.$select) {
      return done(null, _.map(json, j => _.pick(j, template.$select)))
    }
    return callback(new Error(`Unrecognised template type: ${this.name} ${templateName} ${JSON.stringify(template)}`))
  }

  parse(model) { return parse(model) }

  parseSearchQuery(query) {
    const newQuery = {}
    if (!_.isObject(query) || !!(query instanceof Date)) { return query }

    for (const key in query) {
      const value = query[key]
      if (key === '$search') {
        if (this.db === 'mongodb') {
          newQuery.$regex = value
          newQuery.$options = 'i'
        }
        else {
          newQuery.$like = value
        }

      }
      else if (_.isArray(value)) {
        newQuery[key] = (Array.from(value).map((item) => this.parseSearchQuery(item)))
      }
      else if (_.isObject(value)) {
        newQuery[key] = this.parseSearchQuery(value)
      }
      else {
        newQuery[key] = value
      }
    }
    return newQuery
  }

  clean(obj) {
    if (_.isArray(obj)) { return (Array.from(obj).map((o) => this.clean(o))) }
    if (!_.isObject(obj) || !!(obj instanceof Date)) { return obj }

    const finalObj = {}
    for (const key in obj) {
      const value = obj[key]
      if ((key !== '_rev') && !(_.isUndefined(value) || _.isNull(value))) {
        finalObj[key] = this.clean(value)
      }
    }
    return finalObj
  }

  __testEmit() {
    this.events.emit('__testevent', {stuff: 'yep'})
  }
}
