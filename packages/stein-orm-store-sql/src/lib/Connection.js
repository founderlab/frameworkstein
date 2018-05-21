import _ from 'lodash'
import Knex from 'knex'
import DatabaseUrl from './DatabaseUrl'


const pool = {}

class KnexConnection {
  constructor(knex) {
    this.knex = knex
  }
  destroy() {} // TODO: look for a way to close knex
}

module.exports = class Connection {
  constructor(fullUrl) {
    const databaseUrl = new DatabaseUrl(fullUrl)
    this.url = databaseUrl.format({excludeTable: true, excludeQuery: true}) // pool the raw endpoint without the table

    if (pool[this.url]) {
      this.knexConnection = pool[this.url]
      return // found in pool
    }

    if (databaseUrl.protocol !== 'postgres') {
      throw new Error(`Unrecognized sql variant: ${fullUrl} for protocol: ${databaseUrl.protocol}. Only postgres is supported.`)
    }

    const connectionInfo = _.extend({host: databaseUrl.hostname, database: databaseUrl.database, charset: 'utf8'}, databaseUrl.parseAuth() || {})

    const knex = Knex({client: databaseUrl.protocol, connection: connectionInfo})
    this.knexConnection = new KnexConnection(knex)
    pool[this.url] = this.knexConnection
  }

  knex() { return (this.knexConnection != null ? this.knexConnection.knex : undefined) }
}
