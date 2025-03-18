/* eslint-disable
    new-cap,
*/
import _ from 'lodash'
import path from 'path'
import Queue from 'queue-async'
import { parseAsync } from 'json2csv'
import { parse, parseField, parseDates, parseQuery } from './lib/parsers'
import JsonController from './lib/JsonController'
import JoinTableControllerSingleton from './lib/JoinTableControllerSingleton'
import defaultTemplate from './lib/defaultTemplate'


export default class RestController extends JsonController {

  constructor(app, options={}) {
    super(app, options)
    this.METHODS = ['show', 'index', 'create', 'update', 'destroy', 'destroyByQuery', 'head', 'headByQuery']

    if (!this.whitelist) this.whitelist = {}
    if (!this.templates) this.templates = {}
    if (this.routePrefix) this.route = path.join(this.routePrefix, this.route)

    // Initialize timing options
    this.enableTiming = options.enableTiming || this.verbose || !!options.timingCallback || false
    this.timingCallback = options.timingCallback || null

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

  async index(req, res) {
    try {
      const cache = this.cache ? this.cache.cache : null

      if (this.requireXhr && !req.xhr) return this.sendStatus(res, 400)
      if (req.method === 'HEAD') return this.headByQuery(req, res)

      let result
      if (this.verbose) { console.time(`index_${this.route}`) }
      if (cache) {
        const key = `${this.cache.hash}|index_${JSON.stringify(req.query)}`
        result = await cache.wrap(key, (() => this.fetchJSON(req, this.whitelist.index)), this.cache)
      }
      else {
        result = await this.fetchJSON(req, this.whitelist.index)
      }

      if (this.verbose) { console.timeEnd(`index_${this.route}`) }
      const { json, status, message } = result
      if (status) return this.sendStatus(res, status, message)
      if (req.query.$csv) return this.sendCSV(req, res, json)
      return res.json(json)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async show(req, res) {
    try {
      const cache = this.cache ? this.cache.cache : null

      req.query.id = this.requestId(req)
      req.query.$one = true

      let result
      if (this.verbose) { console.time(`show_${this.route}`) }
      if (cache) {
        const key = `${this.cache.hash}|show_${JSON.stringify(req.query)}`
        result = await cache.wrap(key, (() => this.fetchJSON(req, this.whitelist.show)), this.cache)
      }

      result = await this.fetchJSON(req, this.whitelist.show)

      if (this.verbose) { console.timeEnd(`show_${this.route}`) }
      const { json, status, message } = result
      if (status) return this.sendStatus(res, status, message)
      return res.json(json)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async fetchJSON(req, whitelist) {
    const key = `fetchJSON_${this.route}`
    const startTime = Date.now()
    let timingData = null

    if (this.enableTiming) {
      // Initialize timing data for this request
      timingData = {
        route: this.route,
        method: req.method,
        startTime,
        query: req.query,
        sqlQuery: null,
        duration: null,
        endTime: null,
      }

      if (this.verbose) console.time(key)
    }
    else if (this.verbose) {
      console.time(key)
    }

    let query = this.parseSearchQuery(parseQuery(req.query))
    if (this.preprocessQuery) {
      query = this.preprocessQuery(req, query)
    }

    let cursor = this.modelType.cursor(query)
    if (whitelist) cursor = cursor.whiteList(whitelist)

    // Store the SQL query if timing is enabled
    if (this.enableTiming && timingData) {
      timingData.sqlQuery = cursor.toSql()
    }

    const json = await cursor.toJSON()

    if (this.enableTiming && timingData) {
      timingData.duration = Date.now() - startTime
      timingData.endTime = Date.now()

      // Store timing info in the request for middleware access
      req.timingData = timingData

      // Call the timing callback if provided
      if (this.timingCallback && typeof this.timingCallback === 'function') {
        this.timingCallback(timingData, req)
      }

      if (this.verbose) console.timeEnd(key)
    }
    else if (this.verbose) {
      console.timeEnd(key)
    }

    if (cursor.hasCursorQuery('$count') || cursor.hasCursorQuery('$exists')) return {json: {result: json}}

    if (this.modelType.canViewJSON) {
      const authResult = await this.modelType.canViewJSON({...req, query, json})
      if (authResult === false || (_.isObject(authResult) && !authResult.authorised)) return {status: 401, message: (authResult && authResult.message) || 'Unauthorised'}
    }

    if (!json) {
      if (cursor.hasCursorQuery('$one')) {
        return {status: 404}
      }
      return {json}
    }

    if (cursor.hasCursorQuery('$page')) {
      const renderedJson = await this.render(req, json.rows)
      json.rows = renderedJson
      return {json}
    }
    else if (cursor.hasCursorQuery('$values')) {
      return {json}
    }

    const renderedJson = await this.render(req, json)
    return {json: renderedJson}
  }

  async create(req, res) {
    try {
      let json = parseDates(this.whitelist.create ? _.pick(req.body, this.whitelist.create) : req.body)
      const model = new this.modelType(this.parse(json))
      await model.save()
      this.clearCache()

      json = this.whitelist.create ? _.pick(model.toJSON(), this.whitelist.create) : model.toJSON()
      const renderedJson = await this.render(req, json)
      this.events.emit('create', { req, res, model, json: renderedJson })
      return res.json(renderedJson)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async update(req, res) {
    try {
      let json = parseDates(this.whitelist.update ? _.pick(req.body, this.whitelist.update) : req.body)
      const model = await this.modelType.find(this.requestId(req))
      if (!model) return this.sendStatus(res, 404)
      await model.save(this.parse(json))
      this.clearCache()

      json = this.whitelist.update ? _.pick(model.toJSON(), this.whitelist.update) : model.toJSON()
      const renderedJson = await this.render(req, json)
      this.events.emit('update', { req, res, model, json: renderedJson })
      return res.json(renderedJson)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async destroy(req, res) {
    try {
      const id = this.requestId(req)

      if (this.modelType.canDestroyJSON) {
        const authResult = await this.modelType.canDestroyJSON({...req, id})
        if (authResult === false || (_.isObject(authResult) && !authResult.authorised)) return this.sendStatus(res, 401, (authResult && authResult.message) || 'Unauthorised')
      }

      await this.modelType.destroy(id)
      this.clearCache()
      this.events.emit('destroy', {req, res, id})

      return res.json({})
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async destroyByQuery(req, res) {
    try {
      await this.modelType.destroy(parseQuery(req.query))
      this.clearCache()
      this.events.emit('destroyByQuery', {req, res})

      return res.json({})
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async head(req, res) {
    try {
      const exists = await this.modelType.exists(this.requestId(req))
      return this.sendStatus(res, exists ? 200 : 404)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  async headByQuery(req, res) {
    try {
      const exists = await this.modelType.exists(parseQuery(req.query))
      return this.sendStatus(res, exists ? 200 : 404)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  _clearCache(callback) {
    const cache = this.cache ? this.cache.cache : null
    if (!callback) callback = () => {}
    if (!cache) return callback()

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
      if (err) console.log(`[${this.modelType.name} controller] Error clearing cache: `, err)
      callback(err)
    })
  }
  clearCache(...args) {
    return this._promiseOrCallbackFn(this._clearCache)(...args)
  }

  _clearExpiredCacheKeys(callback) {
    const cache = this.cache ? this.cache.cache : null
    if (!callback) callback = () => {}
    if (!cache) return callback()

    if (!cache.store.hdelBefore) {
      return callback()
    }

    const beforeDate = new Date(Date.now() - (this.cache.ttl || 5 * 60 * 1000))

    cache.store.hdelBefore(this.cache.hash, beforeDate, (err) => {
      if (err) console.log(`[${this.modelType.name} controller] Error clearing cache before ${beforeDate}: `, err)
      callback(err)
    })
  }
  clearExpiredCacheKeys(...args) {
    return this._promiseOrCallbackFn(this._clearExpiredCacheKeys)(...args)
  }

  async render(req, json) {
    let templateName = req.query.$render || req.query.$template || this.defaultTemplate
    const key = `render_${templateName}_${this.route}`
    let single = false

    const done = renderedJson => {
      if (this.verbose) console.timeEnd(key)
      const cleanedJson = this.clean(renderedJson)
      return single ? cleanedJson[0] : cleanedJson
    }

    if (this.verbose) console.time(key)
    if (!templateName) return done(json)

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
    if (!template) throw new Error(`Unrecognized template: ${this.name} ${templateName}`)

    const options = (this.renderOptions ? this.renderOptions(req, templateName) : {})

    if (_.isFunction(template)) {
      const result = await template(json, options)
      return done(result)
    }
    else if (template.$select) {
      return done(_.map(json, j => _.pick(j, template.$select)))
    }
    throw new Error(`Unrecognised template type: ${this.modelType.name} ${templateName} ${JSON.stringify(template)}`)
  }

  parse = model => parse(model)

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

  async sendCSV(req, res, json) {
    try {
      const options = {}
      try {
        options.fields = JSON.parse(req.query.$csv)
      }
      catch (err) {
        options.fields = []
      }
      if (!options.fields.length && json.length) {
        options.fields = []
        for (const row of json) {
          for (const key in row) {
            if (!options.fields.includes(key)) options.fields.push(key)
          }
        }
      }
      const csv = await parseAsync(json, options)
      res.send(csv)
    }
    catch (err) {
      this.sendError(res, err)
    }
  }

  __testEmit() {
    this.events.emit('__testevent', {stuff: 'yep'})
  }

  // Set a callback function to be called with timing information
  setTimingCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Timing callback must be a function')
    }
    this.enableTiming = true
    this.timingCallback = callback
    return this
  }
}
