import _ from 'lodash'
import { promisify } from 'util'
import Queue from 'queue-async'


const KNEX_COLUMN_OPTIONS = ['textType', 'length', 'precision', 'scale', 'value', 'values']

const KNEX_TYPES = {
  datetime: 'dateTime',
  biginteger: 'bigInteger',
}


export default class DatabaseTools {

  constructor(connection, tableName, schema) {
    this.connection = connection
    this.tableName = tableName
    this.schema = schema
  }

  _resetSchema = (options, callback) => {
    if (this.resetting) { return callback() }
    this.resetting = true

    const queue = new Queue(1)
    queue.defer(callback => this.connection.schema.dropTableIfExists(this.tableName).asCallback(callback))
    queue.defer(callback => {
      const joinQueue = new Queue(1)
      _.forEach(this.schema.joinTables(), joinTable => joinQueue.defer(callback => joinTable.store.db().resetSchema(callback)))
      joinQueue.await(callback)
    })

    queue.await(err => {
      this.resetting = false
      if (err) return callback(err)
      this.ensureSchema(options, callback)
    })
  }
  resetSchema = (options, callback) => {
    if (_.isFunction(options)) [callback, options] = [options, {}]
    if (callback) return this._resetSchema(options, callback)
    return promisify(this._resetSchema)(options)
  }

  // Ensure that the schema is reflected correctly in the database
  // Will create a table and add columns as required will not remove columns (TODO)
  _ensureSchema = (options, callback) => {
    if (this.ensuring) { return callback() }
    this.ensuring = true

    const queue = new Queue(1)
    queue.defer(callback => this.createOrUpdateTable(options, callback))
    queue.defer(callback => {
      const joinQueue = new Queue(1)
      _.forEach(this.schema.joinTables(), joinTable => joinQueue.defer(callback => joinTable.store.db().ensureSchema(callback)))
      joinQueue.await(callback)
    })

    return queue.await(err => {
      this.ensuring = false
      callback(err)
    })
  }
  ensureSchema = (options, callback) => {
    if (_.isFunction(options)) [callback, options] = [options, {}]
    if (callback) return this._ensureSchema(options, callback)
    return promisify(this._ensureSchema)(options)
  }

  _createOrUpdateTable = (options, callback) => {
    if (!options) options = {}

    this.hasTable((err, tableExists) => {
      if (err) return callback(err)
      if (options.verbose) { console.log(`Ensuring table: ${this.tableName} (exists: ${!!tableExists}) with fields: '${_.keys(this.schema.fields).join(', ')}' and relations: '${_.keys(this.schema.relations).join(', ')}'`) }

      const columns = []

      // look up the add or update columns
      // NOTE: Knex requires the add an update operations to be performed within the table function.
      // This means that hasColumn being asynchronous requires the check to be done before calling the table function
      _.forEach(this.schema.columns(), columnName => {
        const field = this.schema.fields[columnName]
        if (field) {
          let type = field.type.toLowerCase()
          if (KNEX_TYPES[type]) type = KNEX_TYPES[type]
          columns.push({key: columnName, type, options: field})
        }
      })

      _(this.schema.relations).filter(r => r.type === 'belongsTo').forEach(relation => {
        columns.push({key: relation.foreignKey, type: 'integer', options: {indexed: true, nullable: true}})
      })

      const group = (columns, callback) => {
        if (!tableExists) { return callback(null, {add: columns, update: []}) }

        const result = {add: [], update: []}

        const queue = new Queue()
        _.forEach(columns, columnInfo => queue.defer(callback => {
          this.hasColumn(columnInfo.key, (err, exists) => {
            if (err) return callback(err)
            exists ? result.update.push(columnInfo) : result.add.push(columnInfo)
            return callback()
          })
        }))

        return queue.await(err => callback(err, result))
      }

      return group(columns, (err, result) => {
        if (err) return callback(err)

        return this.connection.schema[tableExists ? 'table' : 'createTable'](this.tableName, table => {
          _.forEach(result.add, columnInfo => this.addColumn(table, columnInfo))
          _.forEach(result.update, columnInfo => this.updateColumn(table, columnInfo))
        }).asCallback(callback)
      })
    })
  }
  createOrUpdateTable = (options, callback) => {
    if (_.isFunction(options)) [callback, options] = [options, {}]
    if (callback) return this._createOrUpdateTable(options, callback)
    return promisify(this._createOrUpdateTable)(options)
  }

  addColumn(table, columnInfo) {
    const columnArgs = [columnInfo.key]

    // Assign column specific arguments
    const constructorOptions = _.pick(columnInfo.options, KNEX_COLUMN_OPTIONS)
    let columnMethod = columnInfo.type

    if (!_.isEmpty(constructorOptions)) {
      // Special case as they take two args
      if (['float', 'decimal'].includes(columnMethod)) {
        columnArgs[1] = constructorOptions.precision
        columnArgs[2] = constructorOptions.scale
      // Assume we've been given one valid argument
      }
      else {
        columnArgs[1] = _.values(constructorOptions)[0]
      }
    }

    // Use jsonb
    if (['json'].includes(columnMethod)) {
      columnMethod = 'jsonb'
    }

    const column = table[columnMethod].apply(table, columnArgs)
    if (columnInfo.options.nullable) { column.nullable() }
    if (columnInfo.options.primary) { column.primary() }
    if (columnInfo.options.indexed) { column.index() }
    if (columnInfo.options.unique) { column.unique() }
    return table
  }

  // TODO: handle column type changes and figure out how to update columns properly
  updateColumn(table, columnInfo) {
    // table.index(columnInfo.key) if columnInfo.options.indexed # fails if the column already exists
    // table.unique(columnInfo.key) if columnInfo.options.unique
  }

  // knex method wrappers
  hasColumn(column, callback) { return this.connection.schema.hasColumn(this.tableName, column).asCallback(callback) }
  hasTable(callback) { return this.connection.schema.hasTable(this.tableName).asCallback(callback) }
  dropTable(callback) { return this.connection.schema.dropTable(this.tableName).asCallback(callback) }
  dropTableIfExists(callback) { return this.connection.schema.dropTableIfExists(this.tableName).asCallback(callback) }
  renameTable(to, callback) { return this.connection.schema.renameTable(this.tableName, to).asCallback(callback) }
}

