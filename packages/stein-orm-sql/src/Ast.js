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
const MULTI_OPERATORS = ['$and', '$or', '$ids']

function parseSortField(sort) {
  if (_.isObject(sort)) {
    return [sort.field, sort.order]
  }
  return sort[0] === '-' ? [sort.substr(1), 'desc'] : [sort, 'asc']
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
    this.modelType = options.modelType
    if (!this.modelType) { throw new Error('Ast requires a modelType option') }

    this.prefixColumns = options.prefixColumns

    if (this.query.$count) { this.count = true }
    if (this.query.$exists) { this.exists = true }
    this.limit = this.query.$limit || (this.query.$one ? 1 : null)
    this.offset = this.query.$offset
    if (this.query.$include) {
      if (!_.isArray(this.query.$include)) { this.query.$include = [this.query.$include] }
      this.prefixColumns = true
      for (const key of Array.from(this.query.$include)) this.join(key, this.getRelation(key), {include: true})
    }

    this.where.conditions = this.parseQuery(this.query, {table: this.modelType.tableName})

    this.setSortFields(this.query.$sort)
    return this.setSelectedColumns()
  }

  // A nested query is as an object that does not contain single value $ operators ($in, $eq, etc)
  isNestedQuery(query) {
    if (!_.isObject(query)) return false
    let isNestedQuery = true
    for (const key in query) {
      if (key[0] === '$' && !_.includes(MULTI_OPERATORS, key)) {
        isNestedQuery = false
        break
      }
    }
    return isNestedQuery
  }

  // Internal parse method that recursively parses the query
  parseQuery(query, options={}) {
    const { table } = options
    if (!options.method) options.method = 'where'
    const conditions = []

    for (const key in query) {
      const value = query[key]
      if (key[0] !== '$') {
        if (_.isUndefined(value)) throw new Error(`Unexpected undefined for query key '${key}'`)

        const relation = this.modelType.relation(key)
        const reverseRelation = this.modelType.reverseRelation(key)

        // check if this is a related field and we're given a nested query for a value
        // if we have one create another ast for the nested query
        if (relation && this.isNestedQuery(value)) {
          conditions.push(this.createRelatedAstCondition(relation, value))
        }
        // A dot indicates a condition on a relation model
        else if (key.indexOf('.') > 0) {
          let cond = this.parseJsonField(key, value, options)
          if (cond) {
            conditions.push(cond)
          }
          else {
            cond = this.parseDotRelation(key, value, options)
            conditions.push(cond)
          }

        // Many to Many relationships may be queried on the foreign key of the join table
        }
        else if (reverseRelation && reverseRelation.joinTable) {
          const [cond, relationKey, relation] = this.parseManyToManyRelation(key, value, reverseRelation)
          this.join(relationKey, relation, {pivotOnly: true})
          conditions.push(cond)
        }
        else {
          const cond = this.parseCondition(key, value, {table, method: options.method})
          conditions.push(cond)
        }
      }
    }

    if (query.$ids) {
      const cond = this.parseCondition('id', {$in: query.$ids}, {table})
      conditions.push(cond)
      if (!query.$ids.length) { this.abort = true }
    }

    if (query.$or) {
      const orWhere = {method: options.method, conditions: []}
      for (const q of Array.from(query.$or)) {
        orWhere.conditions.push({
          method: 'orWhere',
          conditions: this.parseQuery(q, {table}),
        })
      }
      conditions.push(orWhere)
    }

    if (query.$and) {
      const andWhere = {method: options.method, conditions: []}
      for (const q of Array.from(query.$and)) {
        andWhere.conditions.push({
          method: 'where',
          conditions: this.parseQuery(q, {table}),
        })
      }
      conditions.push(andWhere)
    }

    return conditions
  }

  createRelatedAstCondition(relation, query) {
    const fk = relation.foreignKey
    const relatedAst = new SqlAst({
      query: {...query, $select: fk},
      modelType: relation.reverseModelType,
    })
    return {
      relation,
      modelType: relation.reverseModelType,
      ast: relatedAst,
      method: 'whereIn',
    }
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
        method: options.method === 'orWhere' ? 'orWhereIn' : 'whereIn',
        dotWhere: this.relatedCondition(keys, value, modelType, options),
      }

    // No further relations to process -  the remaining key is the field to query against
    }
    else {
      const key = keys.pop()
      const dotRelation = relation.reverseModelType.relation(key)
      // check if this is a related field and we're given a nested query for a value
      // if we have one create another ast for the nested query
      // join the intermediate table
      if (dotRelation && this.isNestedQuery(value)) {
        condition = this.createRelatedAstCondition(dotRelation, value)
        this.join(relationKey, relation)
      }
      else {
        options = _.extend(options, {
          relation,
          modelType,
          table: modelType.tableName,
          method: options.method,
        })
        condition = this.parseCondition(key, value, options)
      }
    }
    return condition
  }

  parseDotRelation(key, value, options) {
    return this.relatedCondition(key.split('.'), value, this.modelType, options)
  }

  join(relationKey, relation, options={}) {
    this.prefixColumns = true
    if (!relation) relation = this.getRelation(relationKey)
    const modelType = relation.reverseModelType

    const join = this.joins[relationKey] || {}
    const tableName = modelType.tableName

    const asTableName = relation.isManyToMany() && relation.self ? `_join_${tableName}` : null

    _.extend(join, {
      relation,
      key: relationKey,
      columns: _.map(modelType.schema.columns(), col => this.prefixColumn(col, asTableName || tableName)),
    }, options)

    if (asTableName) join.asTableName = asTableName

    return this.joins[relationKey] = join
  }

  isJsonField(jsonField, _modelType) {
    const modelType = _modelType || this.modelType
    const field = modelType.schema.fields[jsonField]

    if (field && ['json', 'jsonb'].includes(field.type.toLowerCase())) {
      return field
    }
  }

  parseJsonField(key, value, options={}) {
    const [jsonField, attr] = Array.from(key.split('.'))
    const field = this.isJsonField(jsonField)

    if (field) {
      const valueString = JSON.stringify(value)
      const queryString = `{"${attr}": ${valueString}}`
      const cond = {
        method: options.method === 'orWhere' ? 'orWhereRaw' : 'whereRaw',
        key: `"${jsonField}" @> ?`,
        value: field.jsonType === 'object' ? queryString : `[${queryString}]`,
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

  parseCondition(_key, value, options={}) {
    let method = options.method || 'where'
    const key = this.columnName(_key, options.table)

    const condition = {method, conditions: [], relation: options.relation, modelType: options.modelType}

    if (_.isObject(value) && !_.isDate(value)) {
      if (value.$in) {
        if (!_.isArray(value.$in)) {
          const val = JSON.stringify(value)
          throw new Error(`[stein-orm-sql] Unexpected non-array value for $in: ${val}`)
        }
        if (this.isJsonField(_key) || (options.relation && this.isJsonField(_key, options.modelType))) {
          for (const inVal of Array.from(value.$in)) {
            condition.conditions.push({
              method: 'orWhere',
              conditions: [{
                key: '?? \\? ?',
                value: [key, inVal],
                method: 'whereRaw',
                relation: options.relation,
                modelType: options.modelType,
              }],
            })
          }
          return condition
        }
        condition.conditions.push({key, method: method === 'orWhere' ? 'orWhereIn' : 'whereIn', value: value.$in, relation: options.relation, modelType: options.modelType})
      }

      if (value.$nin) {
        condition.conditions.push({key, method: method === 'orWhere' ? 'orWhereNotIn' : 'whereNotIn', value: value.$nin, relation: options.relation, modelType: options.modelType})
      }

      if (value.hasOwnProperty('$exists')) {
        let m = ''
        if (value.$exists) {
          m = method === 'orWhere' ? 'orWhereNotNull' : 'whereNotNull'
        }
        else {
          m = method === 'orWhere' ? 'orWhereNull' : 'whereNull'
        }
        condition.conditions.push({key, method: m, relation: options.relation, modelType: options.modelType})
      }

      // Transform a conditional of type {key: {$like: 'string'}} to ('key', 'like', '%string%')
      if (value.$like) {
        const likeVal = Array.from(value.$like).includes('%') ? value.$like : `%${value.$like}%`
        condition.conditions.push({key, method, operator: 'ilike', value: likeVal, relation: options.relation, modelType: options.modelType})
      }

      // Transform a conditional of type {key: {$lt: 5, $gt: 3}} to [('key', '<', 5), ('key', '>', 3)]
      const mongoConditions = _.pick(value, COMPARATOR_KEYS)
      if (_.size(mongoConditions)) {
        for (const mongoOp in mongoConditions) {
          const mongoVal = mongoConditions[mongoOp]
          const operator = COMPARATORS[mongoOp]

          if (mongoOp === '$ne') {
            if (_.isNull(mongoVal)) {
              condition.conditions.push({key, method: `${method}NotNull`}, {relation: options.relation, modelType: options.modelType})
            }
            else {
              condition.conditions.push({
                method,
                relation: options.relation,
                modelType: options.modelType,
                conditions: [
                  {key, operator, method: 'orWhere', value: mongoVal},
                  {key, method: 'orWhereNull'},
                ],
              })
            }

          }
          else if (_.isNull(mongoVal)) {
            if (mongoOp === '$eq') {
              condition.conditions.push({key, method: `${method}Null`, relation: options.relation, modelType: options.modelType})
            }
            else {
              throw new Error(`Unexpected null with query key '${key}': '${mongoConditions}'`)
            }

          }
          else {
            condition.conditions.push({key, operator, method, value: mongoVal, relation: options.relation, modelType: options.modelType})
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
    if (!sort) return

    this.sort = []
    const toSort = _.isArray(this.query.$sort) ? this.query.$sort : [this.query.$sort]

    for (const sortKey of toSort) {
      const [column, direction] = parseSortField(sortKey)

      if (this.prefixColumns && !column.includes('.')) {
        this.sort.push({column: this.columnName(column, this.modelType.tableName), direction})
      }
      else {
        this.sort.push({column, direction})
      }
    }
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

    this.fields = _.intersection(this.fields, this.columns)

    this.select = []
    for (const col of Array.from(this.fields)) {
      this.select.push(this.prefixColumns ? this.prefixColumn(col, this.modelType.tableName) : col)
    }

    if (this.query.$include) {
      return Array.from(this.query.$include).map((key) =>
        (this.select = this.select.concat(this.joins[key].columns)))
    }
  }

  jsonColumnName = (attr, col, table) => `${table}->'${col}'->>'${attr}'`

  columnName = (col, table) => `${table}.${col}` //if table and @prefixColumns then "#{table}.#{col}" else col

  prefixColumn(col, table) {
    if (Array.from(col).includes('.')) return col
    return `${table}.${col} as ${this.tablePrefix(table)}${col}`
  }

  prefixColumns = (cols, table) => Array.from(cols).map((col) => this.prefixColumn(col, table))

  tablePrefix = table => `${table}_`

  prefixRegex(table) {
    if (!table) table = this.modelType.tableName
    return new RegExp(`^${this.tablePrefix(table)}(.*)$`)
  }

  getRelation(key, modelType) {
    if (!modelType) modelType = this.modelType
    const relation = modelType.schema.relation(key)
    if (!relation) { throw new Error(`${key} is not a relation of ${modelType.modelName}`) }
    return relation
  }

  joinedIncludesWithConditions() {
    const result = []
    for (const key in this.joins) {
      const join = this.joins[key]
      if (join.include && join.condition) {
        result.push(join)
      }
    }
    return result
  }

  print() {
    let s = '********************** AST ******************************'

    s += '---- Input ----\n'
    s += '> query: ' + JSON.stringify(this.query) + '\n\n'

    s += '----  AST  ----\n'
    s += '> select:\n' + this.select + '\n'
    s += '> where:\n'
    s += this.printCondition(this.where)
    console.log('this.where', this.where)

    s += '> joins:\n'
    for (const key in this.joins) {
      const join = this.joins[key]
      s += key + ` include: ${join.include} ` + join.columns.join(', ') + '\n'
    }

    s += '> count: ' + this.count + '\n'
    s += '> exists: ' + this.exists + '\n'
    s += '> sort: ' + this.sort + '\n'
    s += '> limit: ' + this.limit + '\n'

    console.log(s + '\n---------------------------------------------------------\n')
  }

  printCondition(cond, indent='') {
    let s = ''

    const toPrint = _.omit(cond, 'relation', 'modelType', 'previousModelType', 'conditions', 'dotWhere')

    const modelName = cond.modelType != null ? cond.modelType.modelName : undefined
    const previousModelName = cond.relation && cond.relation.modelType && cond.relation.modelType.modelName
    if (modelName) toPrint.modelName = modelName
    if (previousModelName) toPrint.previousModelName = previousModelName

    s += indent + JSON.stringify(toPrint) + '\n'
    // process.env.NODE_ENV ==='test' ? console.log(toPrint) : console.dir(toPrint, {depth: null, colors: true})

    if (cond.conditions != null ? cond.conditions.length : undefined) {
      s += indent + '[\n'
      for (const c of Array.from(cond.conditions)) s += this.printCondition(c, indent + '  ')
      s += indent + ']\n'
    }
    if (cond.dotWhere) {
      s += this.printCondition(cond.dotWhere, indent + '  ')
    }

    return s
  }
}
