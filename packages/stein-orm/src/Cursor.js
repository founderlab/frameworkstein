import _ from 'lodash'
import { promisify } from 'util'


const CURSOR_KEYS = ['$count', '$exists', '$zero', '$one', '$offset', '$limit', '$page', '$sort', '$unique', '$whitelist', '$select', '$include', '$values', '$ids', '$or']

export default class Cursor {

  // @nodoc
  constructor(query, options) {
    this.relatedModelTypesInQuery = this.relatedModelTypesInQuery.bind(this)
    for (var key in options) { const value = options[key]; this[key] = value }
    const parsedQuery = Cursor.parseQuery(query, this.modelType)
    this._find = parsedQuery.find; this._cursor = parsedQuery.cursor

    // ensure arrays
    for (key of ['$whitelist', '$select', '$values', '$unique']) { if (this._cursor[key] && !_.isArray(this._cursor[key])) { this._cursor[key] = [this._cursor[key]] } }
  }

  offset(offset) { this._cursor.$offset = offset; return this }
  limit(limit) { this._cursor.$limit = limit; return this }
  sort(sort) { this._cursor.$sort = sort; return this }

  whiteList(args) {
    const keys = _.flatten(arguments)
    this._cursor.$whitelist = this._cursor.$whitelist ? _.intersection(this._cursor.$whitelist, keys) : keys
    return this
  }

  select(args) {
    const keys = _.flatten(arguments)
    this._cursor.$select = this._cursor.$select ? _.intersection(this._cursor.$select, keys) : keys
    return this
  }

  include(args) {
    const keys = _.flatten(arguments)
    this._cursor.$include = this._cursor.$include ? _.intersection(this._cursor.$include, keys) : keys
    return this
  }

  values(args) {
    const keys = _.flatten(arguments)
    this._cursor.$values = this._cursor.$values ? _.intersection(this._cursor.$values, keys) : keys
    return this
  }

  unique(args) {
    const keys = _.flatten(arguments)
    this._cursor.$unique = this._cursor.$unique ? _.intersection(this._cursor.$unique, keys) : keys
    return this
  }

  // @nodoc
  ids() { this._cursor.$values = ['id']; return this }

  //#############################################
  // Execution of the Query

  _count = (callback) => this.execWithCursorQuery('$count', 'toJSON', callback)
  count = (callback) => callback ? this._count(callback) : promisify(this._count)()

  _exists = (callback) => this.execWithCursorQuery('$exists', 'toJSON', callback)
  exists = (callback) => callback ? this._exists(callback) : promisify(this._exists)()

  _toModel = (callback) => this.execWithCursorQuery('$one', 'toModels', callback)
  toModel = (callback) => callback ? this._toModel(callback) : promisify(this._toModel)()

  _toModels = (callback) => {
    if (this._cursor.$values) { return callback(new Error(`Cannot call toModels on cursor with $values for model ${this.modelType.modelName}. Values: ${JSON.stringify(this._cursor.$values)}`)) }

    return this.toJSON((err, res) => {
      if (err) return callback(err)
      if (this._cursor.$one && !res) return callback(null, null)
      let json = this.hasCursorQuery('$page') ? res.rows : res
      if (!_.isArray(json)) json = [json]

      return this.prepareIncludes(json, (err, json) => {
        const models = _.map(json, data => new this.modelType(data))
        let result
        if (this.hasCursorQuery('$page')) {
          result = res
          result.rows = models
        }
        else if (this._cursor.$one) {
          result = models[0]
        }
        else {
          result = models
        }
        return callback(null, result)
      })
    })
  }
  toModels = (callback) => callback ? this._toModels(callback) : promisify(this._toModels)()

  _toJSON = (callback) => this.queryToJSON(callback)
  toJSON = (callback) => callback ? this._toJSON(callback) : promisify(this._toJSON)()

  // Subclasses must implement
  queryToJSON(callback) { throw new Error('queryToJSON must be implemented by a cursor subclass') }


  //#############################################
  // Helpers
  //#############################################

  // @nodoc
  hasCursorQuery = (key) => this._cursor[key] || (this._cursor[key] === '')

  // @nodoc
  execWithCursorQuery(key, method, callback) {
    const value = this._cursor[key]
    this._cursor[key] = true
    return this[method]((err, json) => {
      if (_.isUndefined(value)) { delete this._cursor[key] }
      else { this._cursor[key] = value }
      return callback(err, json)
    })
  }

  // @nodoc
  relatedModelTypesInQuery() {
    let relationKey
    let relatedFields = []
    const relatedModelTypes = []

    for (let key in this._find) {

      // A dot indicates a condition on a related model
      var reverseRelation
      const value = this._find[key]
      if (key.indexOf('.') > 0) {
        [relationKey, key] = Array.from(key.split('.'))
        relatedFields.push(relationKey)

      // Many to Many relationships may be queried on the foreign key of the join table
      }
      else if ((reverseRelation = this.modelType.reverseRelation(key)) && reverseRelation.joinTable) {
        relatedModelTypes.push(reverseRelation.modelType)
        relatedModelTypes.push(reverseRelation.joinTable)
      }
    }

    if (this._cursor != null ? this._cursor.$include : undefined) { relatedFields = relatedFields.concat(this._cursor.$include) }
    for (relationKey of Array.from(relatedFields)) {
      var relation
      if (relation = this.modelType.schema.relation(relationKey)) {
        relatedModelTypes.push(relation.reverseModelType)
        if (relation.joinTable) { relatedModelTypes.push(relation.joinTable) }
      }
    }

    return relatedModelTypes
  }

  // @nodoc
  selectResults(json) {
    // let item,
    //   key
    let result = json
    if (this._cursor.$one) result = result.slice(0, 1)
    if (this._cursor.$values) {
      const $values = this._cursor.$whitelist ? _.intersection(this._cursor.$values, this._cursor.$whitelist) : this._cursor.$values
      result = this._cursor.$values.length === 1 ? _.map(json, item => item[$values[0]] || null) : _.map(json, item => _.map($values, key => item[key] || null))
    }
    else if (this._cursor.$select) {
      let $select = this._cursor.$whitelist ? _.intersection(this._cursor.$select, this._cursor.$whitelist) : this._cursor.$select
      $select = _.map($select, field => field.includes('.') ? field.split('.').pop() : field)
      result = _.map(json, item => _.pick(item, $select))
    }
    else if (this._cursor.$whitelist) {
      result = _.map(json, item => _.pick(item, this._cursor.$whitelist))
    }

    if (this.hasCursorQuery('$page')) return result // paging expects an array
    if (this._cursor.$one) return result[0] || null

    return result
  }

  // @nodoc
  prepareIncludes(json, callback) {
    if (!_.isArray(this._cursor.$include) || _.isEmpty(this._cursor.$include)) return callback(null, json)
    const schema = this.modelType.schema

    for (const include of this._cursor.$include) {
      const relation = schema.relation(include)

      for (const modelJson of json) {
        // many
        const relatedJson = modelJson[include]
        if (_.isArray(relatedJson)) {
          modelJson[include] = _.map(relatedJson, item => new relation.reverseModelType(item))
        }
        // one
        else if (relatedJson) {
          modelJson[include] = new relation.reverseModelType(relatedJson)
        }
      }
    }

    return callback(null, json)
  }

  // @nodoc
  static validateQuery(query, memo, modelType) {
    const result = []
    for (const key in query) {
      const value = query[key]
      if (!_.isUndefined(value) && !_.isObject(value)) { continue }
      const fullKey = memo ? `${memo}.${key}` : key
      if (_.isUndefined(value)) { throw new Error(`Unexpected undefined for query key '${fullKey}' on ${(modelType != null ? modelType.modelName : undefined)}`) }
      if (_.isObject(value)) { result.push(this.validateQuery(value, fullKey, modelType)) }
      else {
        result.push(undefined)
      }
    }
    return result
  }

  // @nodoc
  static parseQuery(query, modelType) {
    if (!query) {
      return {find: {}, cursor: {}}
    }
    else if (!_.isObject(query)) {
      return {find: {id: query}, cursor: {$one: true}}
    }
    else if (query.find || query.cursor) {
      return {find: query.find || {}, cursor: query.cursor || {}}
    }
    try {
      this.validateQuery(query, null, modelType)
    }
    catch (e) {
      throw new Error(`Error: ${e}. Query: `, query)
    }
    const parsedQuery = {find: {}, cursor: {}}
    for (const key in query) {
      const value = query[key]
      if (key[0] !== '$') { parsedQuery.find[key] = value }
      else { parsedQuery.cursor[key] = value }
    }
    return parsedQuery
  }

}
