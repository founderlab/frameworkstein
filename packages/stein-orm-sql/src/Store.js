import _ from 'lodash'
import knex from 'knex'
import { promisify } from 'util'
import { DatabaseUrl } from 'stein-orm'
import parseJson from './lib/parseJson'
import Ast from './Ast'
import buildQuery from './buildQuery'
import SqlCursor from './Cursor'
import DatabaseTools from './DatabaseTools'


const connectionPool = {}

export default class SqlStore {

  constructor(modelType, options = {}) {
    this.modelType = modelType
    this.url = options.url
    if (!this.url) throw new Error(`Missing url for model ${this.modelType.name}`)

    this.databaseUrl = new DatabaseUrl(this.url)
    if (this.databaseUrl.protocol !== 'postgres') {
      throw new Error(`Unrecognized sql variant: ${this.url} for protocol: ${this.databaseUrl.protocol}. Only postgres is supported.`)
    }
    this.table = this.databaseUrl.table
  }

  /*
   * Return a knex connection using one from our pool if it exists or creating a new one if needed
   */
  connection = () => {
    const databaseUrl = this.databaseUrl
    const connectionInfo = _.extend({ host: databaseUrl.hostname, database: databaseUrl.database, charset: 'utf8' }, databaseUrl.parseAuth() || {})
    if (!this.poolUrl) this.poolUrl = databaseUrl.format({ excludeTable: true, excludeQuery: true })

    if (!connectionPool[this.poolUrl]) connectionPool[this.poolUrl] = knex({ client: databaseUrl.protocol, connection: connectionInfo })
    return connectionPool[this.poolUrl]
  }

  db = () => this.dbTools || (this.dbTools = new DatabaseTools(this.connection(), this.table, this.modelType.schema))

  /*
   * Close connection
   */
  _disconnect = (query, callback) => {
    this.connection().destroy(callback)
  }
  disconnect = (callback) => callback ? this._disconnect(callback) : promisify(this._disconnect)()

  /*
   * Reset all columns in this table, erasing all data
   */
  resetSchema = (...args) => this.db().resetSchema(...args)

  /*
   * Return a database cursor for query building
   */
  cursor = (query = {}) => {
    const options = {
      modelType: this.modelType,
      connection: this.connection(),
    }
    return new SqlCursor(query, options)
  }

  /*
   * Insert a model
   */
  _create = (model, callback) => {
    const json = model.toJSON()
    const saveJson = this.parseJSON(json)
    return this.connection()(this.table).insert(saveJson, 'id').asCallback((err, res) => {
      if (err) return callback(err)
      const id = res && res[0] && res[0].id
      if (!id) return callback(new Error(`Failed to create model with data: ${JSON.stringify(model.data)}, received res: ${JSON.stringify(res)}`))
      json.id = id
      return callback(null, parseJson(json, this.modelType.schema))
    })
  }
  create = (model, callback) => callback ? this._create(model, callback) : promisify(this._create)(model)

  /*
   * Update a model
   */
  _update = (model, callback) => {
    const json = model.toJSON()
    const saveJson = this.parseJSON(json)
    return this.connection()(this.table).where('id', model.id).update(saveJson).asCallback(err => {
      if (err) return callback(err)
      return callback(null, parseJson(json, this.modelType.schema))
    })
  }
  update = (model, callback) => callback ? this._update(model, callback) : promisify(this._update)(model)

  /*
   * Delete a single model
   */
  _delete = (model, callback) => {
    this.connection()(this.table).where('id', model.id).del().asCallback(callback)
  }
  delete = (model, callback) => callback ? this._delete(model, callback) : promisify(this._delete)(model)

  /*
   * Delete by query
   */
  _destroy = (query, callback) => {
    const parsedQuery = SqlCursor.parseQuery(query, this.modelType)
    const ast = new Ast({
      find: parsedQuery.find,
      cursor: parsedQuery.cursor,
      modelType: this.modelType,
    })
    query = this.connection()(this.table)
    query = buildQuery(query, ast)
    query.del().asCallback(callback)
  }
  destroy = (query, callback) => callback ? this._destroy(query, callback) : promisify(this._destroy)(query)

  parseJSON = (_json) => {
    const json = _.clone(_json)
    _.forEach(this.modelType.schema.fields, (value, key) => {
      const needle = value.type && value.type.toLowerCase()
      if (['json', 'jsonb'].includes(needle) && json[key]) {
        json[key] = JSON.stringify(json[key])
      }
    })
    return _.pick(json, this.modelType.schema.columns())
  }
}
