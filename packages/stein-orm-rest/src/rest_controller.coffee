###
  backbone-rest.js 0.5.3
  Copyright (c) 2013 Vidigami - https://github.com/vidigami/backbone-rest
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
###

path = require 'path'
{_, Backbone, Utils, JSONUtils} = require 'backbone-orm'
Queue = require 'queue-async'

JoinTableControllerSingleton = require './lib/join_table_controller_singleton'

module.exports = class RESTController extends (require './lib/json_controller')
  @METHODS: ['show', 'index', 'create', 'update', 'destroy', 'destroyByQuery', 'head', 'headByQuery']

  constructor: (app, options={}) ->
    super(app, _.defaults({headers: RESTController.headers}, options))
    @whitelist or= {}; @templates or= {}
    @route = path.join(@route_prefix, @route) if @route_prefix

    app.get @route, @wrap(@index)
    app.get "#{@route}/:id", @wrap(@show)

    app.post @route, @wrap(@create)
    app.put "#{@route}/:id", @wrap(@update)

    del = if app.hasOwnProperty('delete') then 'delete' else 'del'
    app[del] "#{@route}/:id", @wrap(@destroy)
    app[del] @route, @wrap(@destroyByQuery)

    app.head "#{@route}/:id", @wrap(@head)
    app.head @route, @wrap(@headByQuery)

    @db = (_.result(new @model_type, 'url') || '').split(':')[0]

    if _.isUndefined(@templates.show)
      schema = @model_type.prototype.sync('sync').schema
      schemaKeys = _.keys(schema.type_overrides).concat(_.keys(schema.fields))
      @templates.show = {$select: schemaKeys}
    @default_template = 'show' if _.isUndefined(@templates.show)

    if @cache
      @cache = _.pick(@cache, 'cache', 'hash', 'createHash', 'cascade')
      if @cache.createHash and not @cache.hash
        @cache.hash = @cache.createHash(@)
      else
        @cache.hash or= @route
    JoinTableControllerSingleton.generateByOptions(app, options)

  requestId: (req) => JSONUtils.parseField(req.params.id, @model_type, 'id')

  index: (req, res) =>
    return @headByQuery.apply(@, arguments) if req.method is 'HEAD' # Express4

    done = (err, result) =>
      console.timeEnd("index_#{@route}") if @verbose
      return @sendError(res, err) if err
      {json, status} = result
      return @sendStatus(res, status) if status
      res.json(json)

    console.time("index_#{@route}") if @verbose
    if (cache = @cache?.cache)
      key = "#{@cache.hash}|index_#{JSON.stringify(req.query)}"
      return cache.wrap key, ((callback) => @fetchIndexJSON(req, callback)), @cache, done
    else
      @fetchIndexJSON req, done

  show: (req, res) =>
    done = (err, result) =>
      console.timeEnd("show_#{@route}") if @verbose
      return @sendError(res, err) if err
      {json, status} = result
      return @sendStatus(res, status) if status
      res.json(json)

    req.query.id = @requestId(req)
    req.query.$one = true

    console.time("show_#{@route}") if @verbose
    if (cache = @cache?.cache)
      key = "#{@cache.hash}|show_#{JSON.stringify(req.query)}"
      return cache.wrap key, ((callback) => @fetchShowJSON(req, callback)), @cache, done
    else
      @fetchShowJSON req, done

  create: (req, res) =>
    json = JSONUtils.parseDates(if @whitelist.create then _.pick(req.body, @whitelist.create) else req.body)
    model = new @model_type(@model_type::parse(json))

    event_data = {req: req, res: res, model: model}
    @constructor.trigger('pre:create', event_data)

    model.save (err) =>
      return @sendError(res, err) if err
      @clearCache()

      event_data.model = model
      json = if @whitelist.create then _.pick(model.toJSON(), @whitelist.create) else model.toJSON()
      @render req, json, (err, json) =>
        return @sendError(res, err) if err
        @constructor.trigger('post:create', _.extend(event_data, {json}))
        res.json(json)

  update: (req, res) =>
    json = JSONUtils.parseDates(if @whitelist.update then _.pick(req.body, @whitelist.update) else req.body)

    @model_type.find @requestId(req), (err, model) =>
      return @sendError(res, err) if err
      return @sendStatus(res, 404) unless model

      event_data = {req: req, res: res, model: model}
      @constructor.trigger('pre:update', event_data)

      model.save model.parse(json), (err) =>
        return @sendError(res, err) if err
        @clearCache()

        event_data.model = model
        json = if @whitelist.update then _.pick(model.toJSON(), @whitelist.update) else model.toJSON()
        @render req, json, (err, json) =>
          return @sendError(res, err) if err
          @constructor.trigger('post:update', _.extend(event_data, {json}))
          res.json(json)

  destroy: (req, res) =>
    event_data = {req: req, res: res}
    @constructor.trigger('pre:destroy', event_data)

    @model_type.exists id = @requestId(req), (err, exists) =>
      return @sendError(res, err) if err
      return @sendStatus(res, 404) unless exists

      @model_type.destroy id, (err) =>
        return @sendError(res, err) if err
        @clearCache()
        @constructor.trigger('post:destroy', event_data)
        res.json({})

  destroyByQuery: (req, res) =>
    event_data = {req: req, res: res}
    @constructor.trigger('pre:destroyByQuery', event_data)
    @model_type.destroy JSONUtils.parseQuery(req.query), (err) =>
      return @sendError(res, err) if err
      @clearCache()
      @constructor.trigger('post:destroyByQuery', event_data)
      res.json({})

  head: (req, res) =>
    @model_type.exists @requestId(req), (err, exists) =>
      return @sendError(res, err) if err
      @sendStatus(res, if exists then 200 else 404)

  headByQuery: (req, res) =>
    @model_type.exists JSONUtils.parseQuery(req.query), (err, exists) =>
      return @sendError(res, err) if err
      @sendStatus(res, if exists then 200 else 404)

  clearCache: (callback) =>
    callback or= () =>
    return callback() unless cache = @cache?.cache
    unless cache.store.hreset
      return cache.reset(callback) if cache.reset
      return callback()

    queue = new Queue()
    hash_keys = [@cache.hash].concat(k for k in @cache.cascade or [])
    console.log('clearCache keys', hash_keys)

    for hash_key in hash_keys
      do (hash_key) -> queue.defer (callback) -> cache.store.hreset hash_key, callback

    queue.await (err) =>
      console.log("[#{@model_type.name} controller] Error clearing cache: ", err) if err
      callback(err) if callback

  fetchIndexJSON: (req, callback) => @fetchJSON req, @whitelist.index, callback
  fetchShowJSON: (req, callback) => @fetchJSON req, @whitelist.show, callback

  fetchJSON: (req, whitelist, callback) =>
    key = "fetchJSON_#{@route}"
    console.time(key) if @verbose

    query = @parseSearchQuery(JSONUtils.parseQuery(req.query))
    cursor = @model_type.cursor(query)
    cursor = cursor.whiteList(whitelist) if whitelist

    cursor.toJSON (err, json) =>
      console.timeEnd(key) if @verbose
      return callback(err) if err

      return callback(null, {json: {result: json}}) if cursor.hasCursorQuery('$count') or cursor.hasCursorQuery('$exists')

      unless json
        if cursor.hasCursorQuery('$one')
          return callback(null, {status: 404})
        else
          return callback(null, {json})

      if cursor.hasCursorQuery('$page')
        @render req, json.rows, (err, rendered_json) =>
          return @sendError(res, err) if err
          json.rows = rendered_json
          callback(null, {json})
      else if cursor.hasCursorQuery('$values')
        callback(null, {json})
      else
        @render req, json, (err, rendered_json) => callback(err, {json: rendered_json})

  render: (req, json, callback) =>
    done = (err, rendered_json) =>
      console.timeEnd(key) if @verbose
      return callback(err) if (err)
      callback(null, @clean(rendered_json))

    template_name = req.query.$render or req.query.$template or @default_template
    key = "render_#{template_name}_#{@route}"
    console.time(key) if @verbose
    return done(null, json) unless template_name
    try template_name = JSON.parse(template_name) # remove double quotes
    return callback(new Error "Unrecognized template: #{template_name}") unless template = @templates[template_name]

    options = (if @renderOptions then @renderOptions(req, template_name) else {})

    if template.$raw
      return template json, options, done

    models = if _.isArray(json) then _.map(json, (model_json) => new @model_type(@model_type::parse(model_json))) else new @model_type(@model_type::parse(json))
    JSONUtils.renderTemplate models, template, options, done

  parseSearchQuery: (query) =>
    new_query = {}
    return query unless _.isObject(query) and not (query instanceof Date)

    for key, value of query
      if key is '$search'
        if @db is 'mongodb'
          new_query.$regex = value
          new_query.$options = 'i'
        else
          new_query.$like = value

      else if _.isArray(value)
        new_query[key] = (this.parseSearchQuery(item) for item in value)
      else if _.isObject(value)
        new_query[key] = this.parseSearchQuery(value)
      else
        new_query[key] = value
    return new_query

  clean: (obj) =>
    return (@clean(o) for o in obj) if _.isArray(obj)
    return obj unless (_.isObject(obj) and not (obj instanceof Date))

    final_obj = {}
    for key, value of obj when key isnt '_rev' and not (_.isUndefined(value) or _.isNull(value))
      final_obj[key] = @clean(value)
    return final_obj
