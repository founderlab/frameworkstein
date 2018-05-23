import _ from 'lodash'

const COMPARATORS = {
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $ne: '!=',
  $eq: '=',
}
const COMPARATOR_KEYS = _.keys(COMPARATORS)

function parseSortField(sort) {
  if (sort[0] === '-') { return [sort.substr(1), 'desc'] }
  return [sort, 'asc']
}

export default class SqlAst {

  constructor(options) {
    this.select = []
    this.where = {method: 'where', conditions: []}
    this.joins = {}
    this.sort = null
    this.limit = null
    if (options) { this.parse(options) }
  }

  // Public method that sets up for parsing
  parse(options) {
    this.find = options.find || {}
    this.cursor = options.cursor || {}
    this.query = options.query || _.extend({}, this.find, this.cursor)
    if (!(this.modelType = options.modelType)) { throw new Error('Ast requires a modelType option') }

    this.prefixColumns = options.prefixColumns

    if (this.query.$count) { this.count = true }
    if (this.query.$exists) { this.exists = true }
    this.limit = this.query.$limit || (this.query.$one ? 1 : null)
    this.offset = this.query.$offset
    if (this.query.$include) {
      if (!_.isArray(this.query.$include)) { this.query.$include = [this.query.$include] }
      this.prefixColumns = true
      for (const key of Array.from(this.query.$include)) { this.join(key, this.getRelation(key), {include: true}) }
    }

    this.where.conditions = this.parseQuery(this.query, {table: this.modelType.tableName})

    this.setSortFields(this.query.$sort)
    return this.setSelectedColumns()
  }

  // Internal parse method that recursively parses the query
  parseQuery(query, options) {
    let cond,
      q
    if (options == null) { options = {} }
    const { table } = options
    if (!options.method) { options.method = 'where' }
    const conditions = []

    for (const key in query) {
      const value = query[key]
      if (key[0] !== '$') {
        let reverseRelation

        if (_.isUndefined(value)) { throw new Error(`Unexpected undefined for query key '${key}'`) }

        // A dot indicates a condition on a relation model
        if (key.indexOf('.') > 0) {
          if (cond = this.parseJsonField(key, value, options)) {
            conditions.push(cond)
          }
          else {
            cond = this.parseDotRelation(key, value, options)
            conditions.push(cond)
          }

        // Many to Many relationships may be queried on the foreign key of the join table
        }
        else if ((reverseRelation = this.modelType.reverseRelation(key)) && reverseRelation.joinTable) {
          let relation,
            relationKey;
          [cond, relationKey, relation] = Array.from(this.parseManyToManyRelation(key, value, reverseRelation))
          this.join(relationKey, relation, {pivotOnly: true})
          conditions.push(cond)

        }
        else {
          cond = this.parseCondition(key, value, {table, method: options.method})
          conditions.push(cond)
        }
      }
    }

    if (query != null ? query.$ids : undefined) {
      cond = this.parseCondition('id', {$in: query.$ids}, {table})
      conditions.push(cond)
      if (!query.$ids.length) { this.abort = true }
    }

    if (query != null ? query.$or : undefined) {
      const orWhere = {method: options.method, conditions: []}
      for (q of Array.from(query.$or)) {
        orWhere.conditions = orWhere.conditions.concat(this.parseQuery(q, {table, method: 'orWhere'}))
      }
      conditions.push(orWhere)
    }

    if (query != null ? query.$and : undefined) {
      const andWhere = {method: options.method, conditions: []}
      for (q of Array.from(query.$and)) {
        andWhere.conditions = andWhere.conditions.concat(this.parseQuery(q, {table}))
      }
      conditions.push(andWhere)
    }

    return conditions
  }

  // Take a list of relation keys and create conditions for them
  // The final key is the field of the final model to query on
  //
  // keys may be of the form `reverse.final.name`
  // where `reverse` and `final` are relations
  // and `name` is the field to query on from the `final` relation
  //
  // recursively nest conditions via the `dotWhere` property on the conditions
  relatedCondition(keys, value, previousModelType, options) {
    let condition
    const relationKey = keys.shift()
    const relation = this.getRelation(relationKey, previousModelType)
    const modelType = relation.reverseModelType

    // Has further relations to process
    if (keys.length > 1) {
      condition = {
        relation,
        modelType,
        key: relationKey,
        method: 'whereIn',
        dotWhere: this.relatedCondition(keys, value, modelType, options),
      }

    // No further relations to process -  the remaining key is the field to query against
    }
    else {
      const key = keys.pop()
      options = _.extend(options, {
        relation,
        modelType,
        table: modelType.tableName,
        method: options.method,
      })
      condition = this.parseCondition(key, value, options)
    }

    return condition
  }

  parseDotRelation(key, value, options) {
    return this.relatedCondition(key.split('.'), value, this.modelType, options)
  }

  join(relationKey, relation, options) {
    if (options == null) { options = {} }
    this.prefixColumns = true
    if (!relation) { relation = this.getRelation(relationKey) }
    const modelType = relation.reverseModelType
    return this.joins[relationKey] = _.extend((this.joins[relationKey] || {}), {
      relation,
      key: relationKey,
      columns: Array.from(modelType.schema.columns()).map((col) => this.prefixColumn(col, modelType.tableName)),
    }, options)
  }

  isJsonField(jsonField, modelType) {
    let needle
    if (!modelType) { ({ modelType } = this) }
    const field = modelType.schema.fields[jsonField]
    return field && (needle = field.type.toLowerCase(), ['json', 'jsonb'].includes(needle))
  }

  parseJsonField(key, value, options) {
    if (options == null) { options = {} }
    const [jsonField, attr] = Array.from(key.split('.'))
    if (this.isJsonField(jsonField)) {
      const value_string = JSON.stringify(value)
      const cond = {
        method: options.method === 'orWhere' ? 'orWhereRaw' : 'whereRaw',
        key: `\"${jsonField}\" @> ?`,
        value: `[{\"${attr}\": ${value_string}}]`,
      }
      return cond
    }

    return null
  }

  parseManyToManyRelation(key, value, reverseRelation) {
    const relation = reverseRelation.reverseRelation
    const relationKey = relation.key
    const cond = this.parseCondition(reverseRelation.foreignKey, value, {relation, modelType: relation.modelType, table: relation.joinTable.tableName})
    return [cond, relationKey, relation]
  }

  parseCondition(_key, value, options) {
    if (options == null) { options = {} }
    let method = options.method || 'where'
    const key = this.columnName(_key, options.table)

    const condition = {method, conditions: [], relation: options.relation, modelType: options.modelType}

    if (_.isObject(value) && !_.isDate(value)) {

      let mongoConditions,
        val
      if (value != null ? value.$in : undefined) {
        //todo: might be better to throw an error if $in isn't an array
        if (!value.$in.length) {
          this.abort = true
          return condition
        }
        if (this.isJsonField(_key) || (options.relation && this.isJsonField(_key, options.modelType))) {
          for (val of Array.from(value.$in)) {
            condition.conditions.push({
              method: 'orWhere',
              conditions: [{
                key: '?? \\? ?',
                value: [key, val],
                method: 'whereRaw',
                relation: options.relation,
                modelType: options.modelType,
              }],
            })
          }
          return condition
        }

        condition.conditions.push({key, method: 'whereIn', value: value.$in, relation: options.relation, modelType: options.modelType})

      }

      if (value != null ? value.$nin : undefined) {
        condition.conditions.push({key, method: 'whereNotIn', value: value.$nin, relation: options.relation, modelType: options.modelType})
      }

      if ((value != null ? value.$exists : undefined) != null) {
        condition.conditions.push({key, method: ((value != null ? value.$exists : undefined) ? 'whereNotNull' : 'whereNull'), relation: options.relation, modelType: options.modelType})
      }

      // Transform a conditional of type {key: {$like: 'string'}} to ('key', 'like', '%string%')
      if (_.isObject(value) && value.$like) {
        val = Array.from(value.$like).includes('%') ? value.$like : `%${value.$like}%`
        condition.conditions.push({key, method, operator: 'ilike', value: val, relation: options.relation, modelType: options.modelType})
      }

      // Transform a conditional of type {key: {$lt: 5, $gt: 3}} to [('key', '<', 5), ('key', '>', 3)]
      if (_.size(mongoConditions = _.pick(value, COMPARATOR_KEYS))) {
        for (const mongoOp in mongoConditions) {
          val = mongoConditions[mongoOp]
          const operator = COMPARATORS[mongoOp]

          if (mongoOp === '$ne') {
            if (_.isNull(val)) {
              condition.conditions.push({key, method: `${method}NotNull`}, {relation: options.relation, modelType: options.modelType})
            }
            else {
              condition.conditions.push({method,
                conditions: [
                  {key, operator, method: 'orWhere', value: val, relation: options.relation},
                  {key, method: 'orWhereNull', relation: options.relation},
                ]})
            }

          }
          else if (_.isNull(val)) {
            if (mongoOp === '$eq') {
              condition.conditions.push({key, method: `${method}Null`, relation: options.relation, modelType: options.modelType})
            }
            else {
              throw new Error(`Unexpected null with query key '${key}': '${mongoConditions}'`)
            }

          }
          else {
            condition.conditions.push({key, operator, method, value: val, relation: options.relation, modelType: options.modelType})
          }
        }
      }

    }
    else if (this.isJsonField(_key) || (options.relation && this.isJsonField(_key, options.modelType))) {
      _.extend(condition, {
        key: '?? \\? ?',
        value: [key, value],
        method: 'whereRaw',
      })
    }
    else {
      if (['where', 'orWhere'].includes(method) && _.isNull(value)) { method = `${method}Null` }
      _.extend(condition, {key, value, method})
    }

    if (_.isArray(condition.conditions) && (condition.conditions.length === 1)) {
      return condition.conditions[0]
    }

    return condition
  }

  // Set up sort columns
  setSortFields(sort) {
    if (!sort) { return }
    this.sort = []
    const to_sort = _.isArray(this.query.$sort) ? this.query.$sort : [this.query.$sort]
    return (() => {
      const result = []
      for (const sortKey of Array.from(to_sort)) {
        const [column, direction] = Array.from(parseSortField(sortKey))
        if (this.prefixColumns && !Array.from(column).includes('.')) {
          result.push(this.sort.push({column: this.columnName(column, this.modelType.tableName), direction}))
        }
        else {
          result.push(this.sort.push({column, direction}))
        }
      }
      return result
    })()
  }

  // Ensure that column references have table prefixes where required
  setSelectedColumns() {
    this.columns = this.modelType.schema.columns()
    if (!Array.from(this.columns).includes('id')) { this.columns.unshift('id') }

    if (this.query.$values) {
      this.fields = this.query.$whitelist ? _.intersection(this.query.$values, this.query.$whitelist) : this.query.$values
    }
    else if (this.query.$select) {
      this.fields = this.query.$whitelist ? _.intersection(this.query.$select, this.query.$whitelist) : this.query.$select
    }
    else if (this.query.$whitelist) {
      this.fields = this.query.$whitelist
    }
    else {
      this.fields = this.columns
    }

    this.select = []
    for (const col of Array.from(this.fields)) {
      this.select.push(this.prefixColumns ? this.prefixColumn(col, this.modelType.tableName) : col)
    }

    if (this.query.$include) {
      return Array.from(this.query.$include).map((key) =>
        (this.select = this.select.concat(this.joins[key].columns)))
    }
  }

  jsonColumnName(attr, col, table) { return `${table}->'${col}'->>'${attr}'` }

  columnName(col, table) { return `${table}.${col}` } //if table and @prefixColumns then "#{table}.#{col}" else col

  prefixColumn(col, table) {
    if (Array.from(col).includes('.')) { return col }
    return `${table}.${col} as ${this.tablePrefix(table)}${col}`
  }

  prefixColumns(cols, table) { return Array.from(cols).map((col) => this.prefixColumn(col, table)) }

  tablePrefix(table) { return `${table}_` }

  prefixRegex(table) {
    if (!table) { table = this.modelType.tableName }
    return new RegExp(`^${this.tablePrefix(table)}(.*)$`)
  }

  getRelation(key, modelType) {
    if (!modelType) modelType = this.modelType
    const relation = modelType.schema.relation(key)
    if (!relation) { throw new Error(`${key} is not a relation of ${modelType.modelName}`) }
    return relation
  }

  joinedIncludesWithConditions() {
    return (() => {
      const result = []
      for (const key in this.joins) {
        const join = this.joins[key]
        if (join.include && join.condition) {
          result.push(join)
        }
      }
      return result
    })()
  }

  print() {
    console.log('********************** AST ******************************')

    console.log('---- Input ----')
    console.log('> query:', this.query)

    console.log()

    console.log('----  AST  ----')
    console.log('> select:', this.select)
    console.log('> where:')
    this.printCondition(this.where)
    console.log('> joins:', ((() => {
      const result = []
      for (const key in this.joins) {
        const join = this.joins[key]
        result.push([key, `include: ${join.include}`, join.columns])
      }
      return result
    })()))
    console.log('> count:', this.count)
    console.log('> exists:', this.exists)
    console.log('> sort:', this.sort)
    console.log('> limit:', this.limit)

    return console.log('---------------------------------------------------------')
  }

  printCondition(cond, indent) {
    if (indent == null) { indent = '' }
    process.stdout.write(indent)
    const to_print = _.omit(cond, 'relation', 'modelType', 'previousModelType', 'conditions', 'dotWhere')
    // console.dir(cond)

    const modelName = cond.modelType != null ? cond.modelType.modelName : undefined
    if (modelName) { to_print.modelName = modelName }

    const previousModelName = __guard__(cond.relation != null ? cond.relation.modelType : undefined, x => x.modelName)
    if (previousModelName) { to_print.previousModelName = previousModelName }

    console.dir(to_print, {depth: null, colors: true})
    if (cond.conditions != null ? cond.conditions.length : undefined) {
      console.log(indent + '[')
      for (const c of Array.from(cond.conditions)) { this.printCondition(c, indent + '  ') }
      console.log(indent + ']')
    }
    if (cond.dotWhere) {
      return this.printCondition(cond.dotWhere, indent + '  ')
    }
  }
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}