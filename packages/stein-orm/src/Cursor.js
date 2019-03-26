/* eslint-disable
  new-cap,
  no-continue,
*/
import _ from 'lodash'
import { promisify } from 'util'

/**
 * This class is created via `Model.cursor()`, which will return an instance of `Cursor` that can be used to build a database query.
 * `Cursor` shouldn't be instantiated outside of the `Model.cursor()` class method.


 * #### Cursor options
 * Cursor accepts the following query options. These options can be specified with chained methods or properties within a query object prefixed with $.

 * `one [bool]` return a single object rather than an array

 * `values [array]` return, for each model found, an array of values rather than an object. For example, Model.cursor().values(['id', name']) will return a 2d array like [[1, 'Bob'], [2, 'Emily']]

 * `select [array]` select only the given fields from the db

 * `count [bool]` return a count of the number of models matching the given query

 * `exists [bool]` return a boolean indicating whether any number of models exist matching the given query

 * `unique [string]` like `select disctinct`, return no more than one result per distinct value of the given field

 * `limit [number]` limit results to the given number of rows

 * `offset [number]` offset results by the given number of rows

 * `page: [bool]` if true, return paging information with results. Querries will return an object of the form {rows, totalRows, offset}


 * #### Field modifiers
 * Each field in a query can either be a plan value, which will be matched against directly, or an object with the following special matches:

 * `$in [array]` field matches any of the given values `{name: {$in: ['bob', emily']}}` => `name in ('bob', 'emily')`

 * `$nin [array]` field matches none of the given values `{name: {$nin: ['bob', emily']}}` => `name not in ('bob', 'emily')`

 * `$exists [bool]` equivalent to a null check `{name: {$exists: true}}` => `name is not null`


 * #### Query conditions
 * Advanced conditional operations

 * `$or [array]` matches any of the given queries `{$or: [{name: 'bob'}, {city: 'sydney'}]}` => `name = 'bob' or city = 'sydney'`

 * `$and [array]` matches all of the given queries. Doesn't do anything on its own, but is useful when nesting conditionals `{$and: [{name: 'bob'}, {city: 'sydney'}]}` => `name = 'bob' and city = 'sydney'`


 * #### Relation queries
 * Related models can be queried using `{'relation.field': value}`. All options available to local fields work with relations. Relations must be configured in each models' schema.

 * For example, if we had a user model related to a profile model containing a `name` field we could domsomething like `{'profile.name': {$in: ['bob', emily']}}`, which would generate sql similar to `select * from users, profiles where profiles.name in ('bob', 'emily') and profiles.user_id = users.id`


 * #### JSONb queries
 * JSON fields can be queried in a similar way to related fields: `{'jsonfield.field': value}`

 * For example, given some models with json data like `{id: 1, nestedUsers: [{name: 'bob'}, {name: 'emily'}]}` we could query on the nestedUsers name field with `{'nestedUsers.name': 'bob'}` or `{'nestedUsers.name': {$in: ['emily', 'frank']}`

 * @example
 * const cursor = MyModel.cursor({name: 'bob', $one: true}) // cursor represents a query for a single model named 'bob'
 * cursor.select('id', 'name')                              // only select the 'id', and 'name' fields. This is equivalent to including {$select: ['id', 'name']} in the query object
 * const results = await cursor.toJSON()                    // toJSON or toModels will execute the query represented by this cursor and return the results
 */
export default class Cursor {

  /**
   * Called with `Model.cursor()`
   * @param {object} query an initial query
   * @param {object} options additional options (currently unused)
   */
  constructor(query, options) {
    this.relatedModelTypesInQuery = this.relatedModelTypesInQuery.bind(this)

    for (const key in options) {
      if (options.hasOwnProperty(key)) this[key] = options[key]
    }

    const parsedQuery = Cursor.parseQuery(query, this.modelType)
    this._find = parsedQuery.find
    this._cursor = parsedQuery.cursor

    // ensure arrays
    for (const key of ['$whitelist', '$select', '$values', '$unique', '$include']) {
      if (this._cursor[key] && !_.isArray(this._cursor[key])) {
        this._cursor[key] = [this._cursor[key]]
      }
    }
  }

  offset(offset) { this._cursor.$offset = offset; return this }
  limit(limit) { this._cursor.$limit = limit; return this }
  sort(sort) { this._cursor.$sort = sort; return this }

  whiteList(...args) {
    const keys = _.flatten(args)
    this._cursor.$whitelist = this._cursor.$whitelist ? _.intersection(this._cursor.$whitelist, keys) : keys
    return this
  }

  select(...args) {
    const keys = _.flatten(args)
    this._cursor.$select = this._cursor.$select ? _.intersection(this._cursor.$select, keys) : keys
    return this
  }

  include(...args) {
    const keys = _.flatten(args)
    this._cursor.$include = this._cursor.$include ? _.intersection(this._cursor.$include, keys) : keys
    return this
  }

  values(...args) {
    const keys = _.flatten(args)
    this._cursor.$values = this._cursor.$values ? _.intersection(this._cursor.$values, keys) : keys
    return this
  }

  unique(...args) {
    const keys = _.flatten(args)
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
  queryToJSON() { throw new Error('queryToJSON must be implemented by a cursor subclass') }


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
      const reverseRelation = this.modelType.reverseRelation(key)
      // const value = this._find[key]
      if (key.indexOf('.') > 0) {
        [relationKey, key] = Array.from(key.split('.'))
        relatedFields.push(relationKey)

      // Many to Many relationships may be queried on the foreign key of the join table
      }
      else if (reverseRelation && reverseRelation.joinTable) {
        relatedModelTypes.push(reverseRelation.modelType)
        relatedModelTypes.push(reverseRelation.joinTable)
      }
    }

    if (this._cursor != null ? this._cursor.$include : undefined) { relatedFields = relatedFields.concat(this._cursor.$include) }
    for (relationKey of Array.from(relatedFields)) {
      const relation = this.modelType.schema.relation(relationKey)
      if (relation) {
        relatedModelTypes.push(relation.reverseModelType)
        if (relation.joinTable) {
          relatedModelTypes.push(relation.joinTable)
        }
      }
    }

    return relatedModelTypes
  }

  // @nodoc
  selectResults(json) {
    let result = json

    if (this._cursor.$one) result = result.slice(0, 1)

    if (this._cursor.$values) {
      const $values = this._cursor.$whitelist ? _.intersection(this._cursor.$values, this._cursor.$whitelist) : this._cursor.$values
      result = this._cursor.$values.length === 1 ? _.map(json, item => item[$values[0]] || null) : _.map(json, item => _.map($values, key => item[key] || null))
    }

    else if (this._cursor.$select) {
      let $select = this._cursor.$select
      if (this._cursor.$include) $select = [...$select, ...this._cursor.$include]
      if (this._cursor.$whitelist) $select = _.intersection(this._cursor.$select, this._cursor.$whitelist)
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
      if (!_.isUndefined(value) && !_.isObject(value)) continue

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
