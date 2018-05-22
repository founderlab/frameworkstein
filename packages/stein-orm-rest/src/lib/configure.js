/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BackboneORM;
const {_} = (BackboneORM = require('backbone-orm'));
const BackboneREST = require('../core');

// set up defaults
BackboneREST.headers = {'Cache-Control': 'no-cache', 'Content-Type': 'application/json'};

module.exports = function(options) {
  if (options.headers) { BackboneREST.headers = options.headers; }
  return BackboneORM.configure(_.omit(options, 'headers'));
};
