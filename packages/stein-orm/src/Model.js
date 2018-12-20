import _ from 'lodash'
import { promisify } from 'util'


export default class FLModel {

  data = {}

  constructor(data={}) {
    // Only apply defaults if the model is created without an id
    if (!data.id) {
      const defaultsSrc = this.constructor.defaults || this.defaults || {}
      this.data = _.cloneDeep(_.isFunction(defaultsSrc) ? defaultsSrc() : defaultsSrc)
    }
    this.set(data)
  }


  /* ------------------
   * Instance getters *
   ------------------ */
  get name() { return this.constructor && this.constructor.name }
  get schema() { return this.constructor && this.constructor.schema }
  get store() {
    if (!this.constructor.store) throw new Error(`Store has not been defined for model ${this.name}`)
    return this.constructor.store
  }
  get url() { return this.store && this.store.url }

  relation = (...args) => this.schema.relation(...args)
  joinTable = (...args) => this.schema.joinTable(...args)


  /* ------------------
   * Instance methods *
   ------------------ */

  /*
   * Legacy, may be removed later
   */
  parse = data => data

  /*
   * Get the value of a data field
   * Kept ofr backwards compatibility with backbone models
   */
  get = key => this.data[key]

  /*
   * Set this models data
   * If a value for `id` is present it is assigned to `model.id`
   */
  set = (field, _data) => {
    let data = {}
    if (_.isObject(field)) {
      data = field
    }
    else if (_.isString(field)) {
      data = {[field]: _data}
    }
    else {
      throw new Error('Unrecognised arguments to set:', field, _data, 'first argument should be a string or object')
    }

    // Check if we need to update a foreign key for a belongsTo relation
    // For example `model.set({relation: {id: 1}})` should be equivalent to `model.set({relation_id: 1})`
    const relationIds = {}
    _.forEach(data, (value, key) => {
      if (value && value.id) {
        const relation = this.schema.relation(key)
        if (relation && relation.type === 'belongsTo') relationIds[relation.foreignKey] = value.id
      }
    })
    _.extend(this.data, relationIds, _.cloneDeep(data))

    if (this.data.id) {
      this.id = this.data.id
    }
    return this
  }

  /*
   * Update a model
   */
  async _save(data={}) {

    // Auto update dates if present in schema
    if (!this.id && !data.createdDate && !this.data.createdDate && this.schema.fields.createdDate) {
      data.createdDate = new Date()
    }
    if (!data.updatedDate && this.schema.fields.updatedDate) {
      data.updatedDate = new Date()
    }

    this.set(data)
    let result
    if (this.id) {
      result = await this.store.update(this)
    }
    else {
      result = await this.store.create(this)
    }

    this.set(result)
    return this
  }
  save = (data, _callback) => {
    let callback
    if (!callback && _.isFunction(data)) {
      callback = data
      data = {}
    }
    else if (_.isFunction(_callback)) callback = _callback
    if (callback) {
      return this._save(data).then(() => callback(null, this)).catch(callback)
    }
    return this._save(data)
  }

  destroy = (callback) => {
    if (!this.id) {
      if (callback) return callback()
      return
    }
    return callback ? this.store.destroy({id: this.id}, callback) : this.store.destroy({id: this.id})
  }

  /*
   * Return this models data
   */
  toJSON = (options={}) => {
    const json = {}
    const keys = options.keys || this.whitelist || _.keys(this.data)

    for (const key of keys) {
      const value = this.data[key]
      const relation = this.schema.relation(key)
      if (relation && relation.type === 'belongsTo') {
        json[relation.foreignKey] = (value && value.id) || value
      }
      else if (_.isArray(value)) {
        json[key] = _.map(value, v => v instanceof FLModel ? v.toJSON(options) : v)
      }
      else if (value instanceof FLModel) {
        json[key] = value.toJSON(options)
      }
      else {
        json[key] = value
      }
    }
    return json
  }

  /* ----------------------
   * Class helper methods *
   ---------------------- */

  static errorMsg(msg) {
    return `${this.modelName} ${msg}`
  }

  static promiseOrCallbackFn(fn) {
    return (...args) => {
      const maybeCb = args[args.length-1]
      if (_.isFunction(maybeCb)) return fn.bind(this)(...args)
      return promisify(fn.bind(this))(...args)
    }
  }


  /* -----------
   * Class api *
   ----------- */

  static initialise() {
    return this.schema.initialise()
  }

  static parse(data) {
    return data
  }

  static cursor(query={}) {
    return this.store.cursor(query)
  }

  static relation(...args) {
    return this.schema.relation(...args)
  }

  static joinTable(...args) {
    return this.schema.joinTable(...args)
  }

  static reverseRelation(...args) {
    return this.schema.reverseRelation(...args)
  }

  static _exists(query, callback) {
    if (arguments.length === 1) [callback, query] = [query, {}]
    return this.store.cursor(query).exists(callback)
  }
  static exists(...args) {
    return this.promiseOrCallbackFn(this._exists)(...args)
  }

  static _count(query, callback) {
    if (arguments.length === 1) [callback, query] = [query, {}]
    return this.store.cursor(query).count(callback)
  }
  static count(...args) {
    return this.promiseOrCallbackFn(this._count)(...args)
  }

  static _find(query, callback) {
    if (!callback) {
      callback = query
      query = {}
    }
    return this.store.cursor(query).toModels(callback)
  }
  static find(...args) {
    return this.promiseOrCallbackFn(this._find)(...args)
  }

  static _findOne(query, callback) {
    if (!callback) {
      callback = query
      query = {$one: true}
    }
    else {
      query = _.isObject(query) ? _.extend({$one: true}, query) : {id: query, $one: true}
    }
    return this.store.cursor(query).toModels(callback)
  }
  static findOne(...args) {
    return this.promiseOrCallbackFn(this._findOne)(...args)
  }

  static _findOrCreate(data, callback) {
    const query = _.extend({$one: true}, data)

    this.findOne(query, (err, model) => {
      if (err) return callback(err)
      if (model) return callback(null, model)

      const m = new this(data)
      m.save(callback)
    })
  }
  static findOrCreate(...args) {
    return this.promiseOrCallbackFn(this._findOrCreate)(...args)
  }

  static _destroy(query, callback) {
    if (!query || _.isFunction(query)) throw new Error(this.errorMsg('Missing query from destroy'))
    if (!_.isObject(query)) {
      query = {id: query}
    }
    else if (_.isEmpty(query)) {
      throw new Error(this.errorMsg(`Received empty query, not destroying everything: ${JSON.stringify(query)}`))
    }
    return this.store.destroy(query, callback)
  }
  static destroy(...args) {
    return this.promiseOrCallbackFn(this._destroy)(...args)
  }

  static get url() { return this.store.url }
  static get table() { return this.store.table }
  static get tableName() { return this.store.table }

}
