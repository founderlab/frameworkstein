import _ from 'lodash'
import naming from './lib/naming'
import One from './relations/One'
import Many from './relations/Many'
import DatabaseUrl from './lib/DatabaseUrl'
import createModel from './createModel'


const RELATION_VARIANTS = {
  hasOne: 'hasOne',
  has_one: 'hasOne',
  HasOne: 'hasOne',

  belongsTo: 'belongsTo',
  belongs_to: 'belongsTo',
  BelongsTo: 'belongsTo',

  hasMany: 'hasMany',
  has_many: 'hasMany',
  HasMany: 'hasMany',
}

// @private
export default class Schema {
  // @nodoc
  constructor(modelType, schema, typeOverrides={}) {
    this.modelType = modelType
    this.typeOverrides = typeOverrides
    this.raw = _.cloneDeep(_.isFunction(schema) ? schema() : schema || {})
    if (!this.raw.id) this.raw.id = ['increments', {indexed: true, primary: true}]
    this.fields = {}
    this.relations = {}
    this.virtualAccessors = {}
    if (this.raw.id) { this._parseField('id', this.raw.id) }
  }

  // @nodoc
  initialise() {
    if (this.isInitialised) return
    this.isInitialised = true
    // initalize in two steps to break circular dependencies
    for (const key in this.raw) {
      const info = this.raw[key]
      this._parseField(key, info)
    }
    for (const key in this.relations) {
      const relation = this.relations[key]
      relation.initialise()
    }
  }
  initialize() { return this.initialise() }

  type(key, newType) {
    if (key === 'id') return this.keyType()
    let other

    // set type
    if (arguments.length === 2) {
      (this.typeOverrides[key] || (this.typeOverrides[key] = {})).type = newType
      return this
    }

    // get type
    const dotIndex = key.indexOf('.')
    if (dotIndex >= 0) {
      // queries like 'flat.id'
      other = key.substr(dotIndex+1)
      key = key.substr(0, dotIndex)
    }

    const type = this.typeOverrides[key] || (this.fields[key] && this.fields[key].type) || (this.relation(key) && this.relation(key).reverseModelType) || (this.reverseRelation(key) && this.reverseRelation(key).modelType)
    if (!type) return null

    if (this.virtualAccessors[key]) {
      if (other) { console.log(`Unexpected other for virtual id key: ${key}.${other}`); return }
      return type.schema ? type.schema.keyType() : type
    }
    if (other) {
      if (type.schema) return type.schema.type(other)
    }
    return type
  }

  keyType = () => 'integer'

  field(key) { return this.fields[key] || this.relation(key) }
  relation(key) {
    return this.relations[key] || this.virtualAccessors[key]
  }
  reverseRelation(reverseKey) {
    for (const key in this.relations) { const relation = this.relations[key]; if (relation.reverseRelation && (relation.reverseRelation.joinKey === reverseKey)) { return relation.reverseRelation } }
    return null
  }
  joinTable(key) {
    return this.relation(key) && this.relation(key).joinTable
  }

  // column and relationship helpers
  columns() {
    const columns = _.keys(this.fields)
    if (!_.find(columns, column => column === 'id')) { columns.push('id') }
    for (const key in this.relations) { const relation = this.relations[key]; if ((relation.type === 'belongsTo')) { columns.push(relation.foreignKey) } }
    return columns
  }

  joinTables() {
    const result = []
    for (const key in this.relations) {
      const relation = this.relations[key]
      if (relation.joinTable) {
        result.push(relation.joinTable)
      }
    }
    return result
  }

  relatedModels() {
    const relatedModelTypes = []
    for (const key in this.relations) {
      const relation = this.relations[key]
      relatedModelTypes.push(relation.reverseModelType)
      if (relation.joinTable) { relatedModelTypes.push(relation.joinTable) }
    }
    return relatedModelTypes
  }

  // @nodoc
  generateJoinTable(relation) {
    const type = relation.modelType.schema.type('id')
    const schema = {}
    schema[relation.joinKey] = [type, {indexed: true}]
    schema[relation.reverseRelation.joinKey] = [(relation.reverseModelType != null ? relation.reverseModelType.schema.type('id') : undefined) || type, {indexed: true}]

    const tableName = Schema.joinTableTableName(relation)
    let url
    try {
      url = `${(new DatabaseUrl(relation.modelType.url)).format({excludeTable: true})}/${tableName}`
    }
    catch (err) {
      url = `/${tableName}`
    }
    const name = naming.modelName(tableName, true)

    const Model = require('./Model')
    const JoinTable = createModel({
      name,
      url,
      schema,
    })(class JoinTable extends Model {})

    return JoinTable
  }

  // Internal

  // @nodoc
  _parseField(key, info) {
    const options = this._fieldInfoToOptions(_.isFunction(info) ? info() : info)
    if (!options.type) return this.fields[key] = options

    // unrecognized
    const type = RELATION_VARIANTS[options.type]
    if (!type) {
      if (!_.isString(options.type)) { throw new Error(`Unexpected type name is not a string: ${JSON.stringify(options)}`) }
      return this.fields[key] = options
    }

    options.type = type
    const relation = type === 'hasMany' ? new Many(this.modelType, key, options) : new One(this.modelType, key, options)
    this.relations[key] = relation
    if (relation.virtualIdAccessor) this.virtualAccessors[relation.virtualIdAccessor] = relation
    if (type === 'belongsTo') this.virtualAccessors[relation.foreignKey] = relation
  }

  // @nodoc
  _fieldInfoToOptions(options) {
    // convert to an object
    if (_.isString(options)) { return {type: options} }
    if (!_.isArray(options)) { return options }

    // type
    const result = {}
    if (_.isString(options[0])) {
      result.type = options[0]
      options = options.slice(1)
      if (options.length === 0) { return result }
    }

    // reverse relation
    if (_.isFunction(options[0]) || !options[0] || (_.isObject(options[0]) && (_.isEmpty(options[0]) || options[0].hasOwnProperty('default') && _.isUndefined(options[0].default)))) {
      result.reverseModelType = _.isFunction(options[0]) ? options[0] : null
      options = options.slice(1)
    }

    // too many options
    if (options.length > 1) {
      throw new Error(`Unexpected field options array: ${JSON.stringify(options)}`)
    }

    // options object
    if (options.length === 1) { _.extend(result, options[0]) }
    return result
  }

  static joinTableTableName(relation) {
    const throughTableName = relation.through || relation.reverseRelation.through
    if (throughTableName) return throughTableName

    const tableName1 = naming.tableName(relation.modelType.modelName)
    const tableName2 = naming.tableName(relation.reverseRelation.modelType.modelName)
    return tableName1.localeCompare(tableName2) < 0 ? `${tableName1}_${tableName2}` : `${tableName2}_${tableName1}`
  }
}
