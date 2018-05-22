/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  backbone-rest.js 0.5.3
  Copyright (c) 2013 Vidigami - https://github.com/vidigami/backbone-rest
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/

let JSONController;
const _ = require('underscore');
const BackboneEvents = (require('backbone')).Events;

module.exports = (JSONController = (function() {
  JSONController = class JSONController {
    static initClass() {
      this.prototype._call = this.prototype.wrap;
    }
    constructor(app, options) {
      this.wrap = this.wrap.bind(this);
      this._setHeaders = this._setHeaders.bind(this);
      this._reqToCRUD = this._reqToCRUD.bind(this);
      this._dynamicAuth = this._dynamicAuth.bind(this);
      if (options == null) { options = {}; }
      this.configure(options);
      if (!this.headers) { this.headers = {'Cache-Control': 'no-cache', 'Content-Type': 'application/json'}; }
      if (!this.logger) { this.logger = console; }
    }

    configure(options) { if (options == null) { options = {}; } return _.extend(this, options); }

    sendStatus(res, status, message) { res.status(status); if (message) { return res.json({message}); } else { return res.json({}); } }
    sendError(res, err) {
      const { req } = res;
      this.constructor.trigger('error', {req, res, err});
      this.logger.error(`Error 500 from ${req.method} ${req.url}: ${(err != null ? err.stack : undefined) || err}`);
      res.status(500); return res.json({error: err.toString()});
    }

    wrap(fn) {
      let stack = [];
      if (_.isArray(this.auth)) { stack = this.auth.slice(0); // copy so middleware can attach to an instance
      } else if (_.isFunction(this.auth)) { stack.push(this.auth);
      } else if (_.isObject(this.auth)) { stack.push(this._dynamicAuth); }
      stack.push(this._setHeaders);
      stack.push((req, res, next) => {
        if (this.blocked) { let needle;
        if ((needle = this._reqToCRUD(req), Array.from(this.blocked).includes(needle))) { return this.sendStatus(res, 405); } }
        try { return fn.call(this, req, res, next); } catch (err) { return this.sendError(res, err); }
      });
      return stack; // TODO: add deprecation warning
    }

    requestValue(req, key) { if (_.isFunction(req[key])) { return req[key](); } else { return req[key]; } }

    //###############################
    // Private
    //###############################
    _setHeaders(req, res, next) {
      for (let key in this.headers) { const value = this.headers[key]; res.setHeader(key, value); }
      return next();
    }

    _reqToCRUD(req) {
      const req_path = this.requestValue(req, 'path');
      if (req_path === this.route) {
        switch (req.method) {
          case 'GET': return 'index';
          case 'POST': return 'create';
          case 'DELETE': return 'destroyByQuery';
          case 'HEAD': return 'headByQuery';
        }
      } else if (this.requestId(req) && (req_path === `${this.route}/${this.requestId(req)}`)) {
        switch (req.method) {
          case 'GET': return 'show';
          case 'PUT': return 'update';
          case 'DELETE': return 'destroy';
          case 'HEAD': return 'head';
        }
      }
    }

    _dynamicAuth(req, res, next) {
      let auth, crud;
      if (this.auth.hasOwnProperty(crud = this._reqToCRUD(req))) { auth = this.auth[crud];
      } else { auth = this.auth.default; }
      if (!auth) { return next(); }
      if (!_.isArray(auth)) { return auth(req, res, next); }

      let index = -1;
      var exec = function() { if (++index >= auth.length) { return next(); } else { return auth[index](req, res, exec); } };
      return exec();
    }
  };
  JSONController.initClass();
  return JSONController;
})());

_.extend(JSONController, BackboneEvents);
