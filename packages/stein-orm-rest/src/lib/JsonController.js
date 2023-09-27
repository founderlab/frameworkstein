import _ from 'lodash'
import EventEmitter from 'events'
import { promisify } from 'util'


export default class JSONController {

  constructor(app, options = {}) {
    _.extend(this, options)
    if (!this.headers) this.headers = { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' }
    if (!this.logger) this.logger = console
    if (!this.events) this.events = new EventEmitter()
  }

  emit = (...args) => {
    this.constructor.events && this.constructor.events.emit(...args)
    this.events.emit(...args)
  }

  sendStatus = (res, status, message) => {
    res.status(status).json(message ? { message } : {})
  }

  sendError = (res, err) => {
    const { req } = res
    const errorMsg = err.message || (err && err.toString()) || 'Error'
    this.events.emit('err', { req, res, err })
    this.logger.error(`Error 500 from ${req.method} ${req.url}: ${(err != null ? err.stack : undefined) || err}`)
    res.status(500).json({ error: errorMsg })
  }

  wrap = (fn) => {
    let stack = []
    if (_.isArray(this.auth)) {
      stack = this.auth.slice(0) // copy so middleware can attach to an instance
    }
    else if (_.isFunction(this.auth)) {
      stack.push(this.auth)
    }
    else if (_.isObject(this.auth)) { stack.push(this._dynamicAuth) }
    stack.push(this._setHeaders)
    stack.push((req, res, next) => {
      if (this.blocked) {
        let needle
        if ((needle = this._reqToCRUD(req), Array.from(this.blocked).includes(needle))) { return this.sendStatus(res, 405) }
      }
      try { return fn.call(this, req, res, next) }
      catch (err) { return this.sendError(res, err) }
    })
    return stack
  }

  requestValue = (req, key) => _.isFunction(req[key]) ? req[key]() : req[key]

  //###############################
  // Private
  //###############################

  _promiseOrCallbackFn(fn) {
    return (...args) => {
      const maybeCb = args[args.length - 1]
      if (_.isFunction(maybeCb)) return fn.bind(this)(...args)
      return promisify(fn.bind(this))(...args)
    }
  }

  _setHeaders = (req, res, next) => {
    for (const key in this.headers) { const value = this.headers[key]; res.setHeader(key, value) }
    return next()
  }

  _reqToCRUD = (req) => {
    const reqPath = this.requestValue(req, 'path')
    if (reqPath === this.route) {
      switch (req.method) {
        case 'GET': return 'index'
        case 'POST': return 'create'
        case 'DELETE': return 'destroyByQuery'
        case 'HEAD': return 'headByQuery'
        default: return ''
      }
    }
    else if (this.requestId(req) && (reqPath === `${this.route}/${this.requestId(req)}`)) {
      switch (req.method) {
        case 'GET': return 'show'
        case 'PUT': return 'update'
        case 'DELETE': return 'destroy'
        case 'HEAD': return 'head'
        default: return ''
      }
    }
  }

  _dynamicAuth = (req, res, next) => {
    let auth
    const crud = this._reqToCRUD(req)
    if (this.auth.hasOwnProperty(crud)) {
      auth = this.auth[crud]
    }
    else { auth = this.auth.default }
    if (!auth) { return next() }
    if (!_.isArray(auth)) { return auth(req, res, next) }

    let index = -1
    var exec = function () { if (++index >= auth.length) { return next() } return auth[index](req, res, exec) }
    return exec()
  }
}
