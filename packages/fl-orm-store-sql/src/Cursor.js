import _ from 'lodash'
import { Cursor } from 'fl-orm'
import Ast from './Ast'
import buildQuery from './buildQuery'
import parseJson from './lib/parseJson'


function extractCount(countJson) {
  if (!(countJson != null ? countJson.length : undefined)) { return 0 }
  const countInfo = countJson[0]
  return +(countInfo[countInfo.hasOwnProperty('count(*)') ? 'count(*)' : 'count'])
}

export default class SqlCursor extends Cursor {
  constructor(...args) {
    super(...args)
    this.verbose = false
  }

  execUnique = callback => {
    try {
      const ast = new Ast({
        find: this._find,
        cursor: this._cursor,
        modelType: this.modelType,
        prefixColumns: false,
      })
      let query = this.connection(this.modelType.tableName)
      query = buildQuery(query, ast, {skipSelect: true})

      if (this._cursor.$count) {
        query.count().from(this.connection.distinct(this._cursor.$unique).from(this.modelType.tableName).as('count_query'))
        return query.asCallback((err, countJson) => callback(err, extractCount(countJson)))
      }

      // We're not selecting any fields outside of those in $unique, so we can use distinct
      if (_.difference(ast.select, this._cursor.$unique).length === 0) {
        query.distinct(ast.select)

      // Other fields are required - uses partition, a postgres window function
      }
      else {
        const rankField = this._cursor.$unique[0]
        let rawQuery = `${ast.select.map(s => `"${s}"`).join(', ')}, rank() over (partition by "${rankField}"`
        if (ast.sort && ast.sort.length) {
          let sort = ast.sort.shift()
          if (sort) {
            rawQuery += ` order by "${sort.column}" ${sort.direction}`
          }
          for (sort of ast.sort) {
            rawQuery += ` , "${sort.column}" ${sort.direction}`
          }
        }
        rawQuery += ')'
        const subquery = this.connection.select(this.connection.raw(rawQuery))
        subquery.from(this.modelType.tableName).as('subquery')
        query.select(ast.select).from(subquery).where('rank', 1)
      }

      return this.runQuery(query, ast, callback)

    }
    catch (err) {
      console.log(err)
      return callback(new Error(`Query failed for model: ${this.modelType.modelName} with error: ${err}`))
    }
  }

  queryToJSON = callback => {
    let ast, query
    if (this.hasCursorQuery('$zero')) { return callback(null, this.hasCursorQuery('$one') ? null : []) }

    if (!this.verbose) { this.verbose = this._cursor.$verbose }
    if (this.verbose) {
      this.start_time = new Date().getTime()
    }

    if (this.hasCursorQuery('$count')) { this._cursor.$count = true }
    if (this.hasCursorQuery('$exists')) { this._cursor.$exists = true }

    // Unique
    if (this._cursor.$unique) { return this.execUnique(callback) }

    try {
      ast = new Ast({
        find: this._find,
        cursor: this._cursor,
        modelType: this.modelType,
      })
      query = this.connection(this.modelType.tableName)
      query = buildQuery(query, ast)

      // $in : [] or another query that would result in an empty result set in mongo has been given
      if (ast.abort) { return callback(null, this._cursor.$count ? 0 : (this._cursor.$one ? null : [])) }

    }
    catch (err) {
      console.log(err)
      return callback(`Query failed for model: ${this.modelType.modelName} with error: ${err}`)
    }
    return this.runQuery(query, ast, callback)
  }

  runQuery = (query, ast, _callback) => {
    let callback = _callback
    if (this.verbose) {
      this.query_ready_time = new Date().getTime()

      console.log('\n----------')
      ast.print()
      console.dir(query.toString(), {depth: null, colors: true})
      console.log('Built in', this.query_ready_time-this.start_time, 'ms')
      console.log('----------')
      callback = (err, res) => {
        console.log('Query complete in', new Date().getTime() - this.start_time, 'ms')
        return _callback(err, res)
      }
    }

    return query.asCallback((err, json) => {
      if (err) { return callback(new Error(`Query failed for model: ${this.modelType.modelName} with error: ${err}`)) }

      if (this.hasCursorQuery('$count') || this.hasCursorQuery('$exists')) {
        const count = extractCount(json)
        return callback(null, this.hasCursorQuery('$count') ? count : (count > 0))
      }

      if (ast.prefixColumns) { json = this.unjoinResults(json, ast) }

      if (ast.joinedIncludesWithConditions().length) {
        return this.fetchIncludedRelations(json, ast, callback)
      }
      return this.processResponse(json, ast, callback)
    })
  }

  // Process any remaining queries and return the json
  processResponse = (json, ast, callback) => {
    const schema = this.modelType.schema

    for (const modelJson of Array.from(json)) { parseJson(modelJson, schema) }
    json = this.selectResults(json)

    // NOTE: limit and offset would apply to the join table so do as post-process. TODO: optimize
    if (this._cursor.$include) {
      if (this._cursor.$offset) {
        let number = json.length - this._cursor.$offset
        if (number < 0) { number = 0 }
        json = number ? json.slice(this._cursor.$offset, this._cursor.$offset+number) : []
      }

      if (this._cursor.$limit) {
        json = json.splice(0, Math.min(json.length, this._cursor.$limit))
      }
    }

    if (this.hasCursorQuery('$page')) {
      let query = this.connection(this.modelType.tableName)
      query = buildQuery(query, ast, {count: true})

      if (this._cursor.$unique) {
        const subquery = this.connection.distinct(this._cursor.$unique)
        subquery.from(this.modelType.tableName).as('subquery')
        query.from(subquery)
      }
      else {
        query.from(this.modelType.tableName)
      }

      if (this.verbose) {
        console.log('\n---------- counting rows for $page ----------')
        console.dir(query.toString(), {colors: true})
        console.log('---------------------------------------------')
      }

      return query.asCallback((err, countJson) => {
        if (err) return callback(err)
        return callback(null, {
          offset: this._cursor.$offset || 0,
          totalRows: extractCount(countJson),
          rows: json,
        })
      })
    }

    return callback(null, json)
  }

  // Make another query to get the complete set of related objects when they have been fitered by a where clause
  fetchIncludedRelations = (json, ast, callback) => {
    const relation_ast = new Ast({
      modelType: this.modelType,
      query: {
        id: {$in: _.pluck(json, 'id')},
        $select: ['id'],
        $include: (Array.from(ast.joinedIncludesWithConditions()).map((j) => j.key)),
      },
    })
    let relation_query = this.connection(this.modelType.tableName)
    relation_query = buildQuery(relation_query, relation_ast)

    return relation_query.asCallback((err, raw_relationJson) => {
      if (err) return callback(err)
      const relationJson = this.unjoinResults(raw_relationJson, relation_ast)
      for (const placeholder of Array.from(relationJson)) {
        const model = _.find(json, test => test.id === placeholder.id)
        _.extend(model, placeholder)
      }
      return this.processResponse(json, ast, callback)
    })
  }

  // Rows returned from a join query need to be un-merged into the correct json format
  unjoinResults = (rawJson, ast) => {
    if (!rawJson || !rawJson.length) { return rawJson }
    const json = []
    const { modelType } = ast

    for (const row of Array.from(rawJson)) {
      let found, relatedJson, relationKey
      let modelJson = {}
      const row_relationJson = {}

      // Fields are prefixed with the table name of the model they belong to so we can test which the values are for
      // and assign them to the correct object
      for (const key in row) {
        let match
        const value = row[key]
        if (match = ast.prefixRegex().exec(key)) {
          modelJson[match[1]] = value

        }
        else {
          for (relationKey in ast.joins) {
            const join = ast.joins[relationKey]
            if (join.include) {
              relatedJson = (row_relationJson[relationKey] || (row_relationJson[relationKey] = {}))
              if (match = ast.prefixRegex(join.relation.reverseModelType.tableName).exec(key)) {
                relatedJson[match[1]] = value
                found = true
              }
            }
          }
          if (!found) {
            modelJson[key] = value
          }
        }
      }

      // If there was a hasMany relationship or multiple $includes we'll have multiple rows for each model
      if ((found = _.find(json, test => test.id === modelJson.id))) {
        modelJson = found
      // Add this model to the result if we haven't already
      }
      else {
        json.push(modelJson)
      }

      // Add relations to the modelJson if included
      for (relationKey in row_relationJson) {

        relatedJson = row_relationJson[relationKey]
        if (_.isNull(relatedJson.id)) {
          if (modelType.schema.relation(relationKey).type === 'hasMany') {
            modelJson[relationKey] = []
          }
          else {
            modelJson[relationKey] = null
          }

        }
        else if (!_.isEmpty(relatedJson)) {
          const reverseRelationSchema = modelType.schema.relation(relationKey).reverseModelType.schema
          relatedJson = parseJson(relatedJson, reverseRelationSchema)

          if (modelType.schema.relation(relationKey).type === 'hasMany') {
            if (!modelJson[relationKey]) { modelJson[relationKey] = [] }
            if (!_.find(modelJson[relationKey], test => test.id === relatedJson.id)) { modelJson[relationKey].push(relatedJson) }
          }
          else {
            modelJson[relationKey] = relatedJson
          }
        }
      }
    }

    return json
  }

  // selectResults = json => {
  //   let item
  //   if (this._cursor.$one) { json = json.slice(0, 1) }

  //   // TODO: OPTIMIZE TO REMOVE 'id' and '_rev' if needed
  //   if (this._cursor.$values) {
  //     let key
  //     const $values = this._cursor.$whitelist ? _.intersection(this._cursor.$values, this._cursor.$whitelist) : this._cursor.$values
  //     if (this._cursor.$values.length === 1) {
  //       key = this._cursor.$values[0]
  //       json = $values.length ? ((() => {
  //         const result = []
  //         for (item of Array.from(json)) {               if (item.hasOwnProperty(key)) { result.push(item[key]) } else { result.push(null) }
  //         }
  //         return result
  //       })()) : _.map(json, () => null)
  //     }
  //     else {
  //       json = ((() => {
  //         const result1 = []
  //         for (item of Array.from(json)) {
  //           result1.push((() => {
  //             const result2 = []
  //             for (key of Array.from($values)) {
  //               if (item.hasOwnProperty(key)) {
  //                 result2.push(item[key])
  //               }
  //             }
  //             return result2
  //           })())
  //         }
  //         return result1
  //       })())
  //     }

  //   }
  //   else if (this._cursor.$select) {
  //     let $select = (Array.from(this._cursor.$select).map((field) => (Array.from(field).includes('.') ? field.split('.').pop() : field)))
  //     if (this._cursor.$whitelist) { $select = _.intersection($select, this._cursor.$whitelist) }
  //     json = ((() => {
  //       const result3 = []
  //       for (item of Array.from(json)) {             result3.push(_.pick(item, $select))
  //       }
  //       return result3
  //     })())

  //   }
  //   else if (this._cursor.$whitelist) {
  //     json = ((() => {
  //       const result4 = []
  //       for (item of Array.from(json)) {             result4.push(_.pick(item, this._cursor.$whitelist))
  //       }
  //       return result4
  //     })())
  //   }

  //   if (this.hasCursorQuery('$page')) { return json } // paging expects an array
  //   if (this._cursor.$one) { return (json[0] || null) } else { return json }
  // }
}
