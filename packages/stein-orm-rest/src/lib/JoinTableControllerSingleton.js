import _ from 'lodash'
import path from 'path'


class JoinTableControllerSingleton {
  constructor() {
    this.joinTables = {}
  }

  reset() {
    this.joinTables = {}
  }

  generateByOptions(app, options) {
    const routeParts = options.route.split('/')
    routeParts.pop()
    const routeRoot = routeParts.join('/')

    const schema = options.modelType.schema
    const result = []

    _.forEach(schema.relations, (relation, key) => {

      let joinTableEndpoint

      if (!relation || !relation.joinTable) return

      try {
        const joinTableUrl = _.result(new relation.joinTable(), 'url')
        const joinTableParts = joinTableUrl.split('/')
        joinTableEndpoint = joinTableParts.pop()
      }
      catch (err) {
        console.log(`JoinTableControllerSingleton.generateControllers: failed to parse url. Error: ${err}`)
        return
      }

      const joinTableOptions = _.clone(options)
      joinTableOptions.route = path.join(routeRoot, joinTableEndpoint)
      if (joinTableOptions.route[0] !== '/') { joinTableOptions.route = `/${joinTableOptions.route}` }
      if (this.joinTables[joinTableOptions.route]) return // already exists

      for (const _key of ['whitelist', 'templates', 'defaultTemplate']) {
        delete joinTableOptions[_key]
      }

      try {
        if (joinTableOptions.cache && joinTableOptions.cache.createHash) {
          joinTableOptions.cache.cascade = _.uniq([...(joinTableOptions.cache.cascade || []), joinTableOptions.cache.createHash(options)])
        }
      }
      catch (err) {
        console.log(`JoinTableControllerSingleton.generateControllers: failed to assign cache dependencies. Error: ${err}`)
      }

      joinTableOptions.modelType = relation.joinTable
      const joinTableAuth = options.auth ? options.auth.relations && options.auth.relations[key] : null
      if (joinTableAuth) joinTableOptions.auth = joinTableAuth

      // console.log "Generating join table controller at #{joinTableOptions.route}"
      const JoinTableController = require('./JoinTableController')
      result.push(this.joinTables[joinTableOptions.route] = new JoinTableController(app, joinTableOptions))
    })

    return result
  }
}

export default new JoinTableControllerSingleton()
