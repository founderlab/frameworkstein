/* eslint-disable
    guard-for-in,
    import/no-unresolved,
    new-cap,
    no-cond-assign,
    no-continue,
    no-loop-func,
    no-use-before-define,
    no-var,
    one-var,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  backbone-rest.js 0.5.3
  Copyright (c) 2013 Vidigami - https://github.com/vidigami/backbone-rest
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
*/

const path = require('path')
const {_} = require('backbone-orm')

let JoinTableController = null

class JoinTableControllerSingleton {
  constructor() {
    this.join_tables = {}
  }

  reset() {
    return this.join_tables = {}
  }

  generateByOptions(app, options) {
    if (!JoinTableController) { JoinTableController = require('./join_table_controller') } // dependency cycle

    const route_parts = options.route.split('/')
    route_parts.pop()
    const route_root = route_parts.join('/')

    const schema = options.model_type.schema()
    return (() => {
      const result = []
      for (var key in schema.relations) {
        var join_table_auth,
          join_table_endpoint
        const relation = schema.relations[key]
        if (!relation || !relation.join_table) { continue }
        try {
          const join_table_url = _.result(new relation.join_table(), 'url')
          const join_table_parts = join_table_url.split('/')
          join_table_endpoint = join_table_parts.pop()
        }
        catch (err) {
          console.log(`JoinTableControllerSingleton.generateControllers: failed to parse url. Error: ${err}`)
          continue
        }

        const join_table_options = _.clone(options)
        join_table_options.route = path.join(route_root, join_table_endpoint)
        if (join_table_options.route[0] !== '/') { join_table_options.route = `/${join_table_options.route}` }
        if (this.join_tables[join_table_options.route]) { continue } // already exists
        for (const _key of ['whitelist', 'templates', 'default_template']) { delete join_table_options[_key] }
        join_table_options.model_type = relation.join_table
        if (join_table_auth = __guard__(options.auth != null ? options.auth.relations : undefined, x => x[key])) { join_table_options.auth = join_table_auth }
        // console.log "Generating join table controller at #{join_table_options.route}"
        result.push(this.join_tables[join_table_options.route] = new JoinTableController(app, join_table_options))
      }
      return result
    })()
  }
}

module.exports = new JoinTableControllerSingleton()

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
