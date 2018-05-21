import _ from 'lodash'
import { promisify } from 'util'


export default class FLModel {

  constructor(data={}) {
    this.data = {}
    this.set(data)
  }


  /* ---------
   * Helpers *
   --------- */
  // might not be needed, accessible from class
  get name() { return this.constructor && this.constructor.name }
  get schema() { return this.constructor && this.constructor.schema }
  relation = (...args) => this.schema.relation(...args)
  joinTable = (...args) => this.schema.joinTable(...args)

  get store() {
    if (!this.constructor.store) throw new Error(`Store has not been defined for model ${this.name}`)
    return this.constructor.store
  }

  /*
   * Instance helper, returns store url
   */
  get url() { return this.store && this.store.url }

  /*
   * Legacy, may be removed later
   */
  parse = data => data


  /* ------------------
   * Instance methods *
   ------------------ */

  /*
   * Set this models data
   * If a value for `id` is present it is assigned to `model.id`
   */
  set = (data={}) => {
    _.merge(this.data, data)
    if (this.data.id) {
      this.id = this.data.id
    }
    return this
  }

  /*
   * Update a model
   */
  async _save(data={}) {
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
    if (!callback && _.isFunction(data)) callback = data
    else if (_.isFunction(_callback)) callback = _callback
    if (callback) {
      return this._save(data).then(data => callback(null, this)).catch(callback)
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
  // toJSON = () => this.data
  toJSON = (options={}) => {
    const json = {}
    const keys = options.keys || this.whitelist || _.keys(this.data)

    for (const key of keys) {
      const value = this.data[key]
      const relation = this.schema.relation(key)
      if (relation) {
        if (relation.type === 'belongsTo') json[relation.foreignKey] = (value && value.id) || value
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

  // static async findOrCreate(data, callback) {
  //   const query = _.extend({$one: true}, data)
  //   const model = await this.store.cursor(query).toModels()
  //   if (model) return model
  //   return (new this(data)).save()
  // }

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


  /*
   * Class methods
   */
  // // @nodoc
  // read(model, options) => {
  //   let modelJson
  //   if (model.models) => {
  //     return options.success((() => {
  //       const result = []
  //       for (modelJson of Array.from(this.store)) => {
  //         result.push(JSONUtils.deepClone(modelJson))
  //       }
  //       return result
  //     })())
  //   }
  //   if (!(modelJson = this.get(model.id))) => { return options.error(new Error(`Model not found with id: ${model.id}`)) }
  //   return options.success(JSONUtils.deepClone(modelJson))

  // }

  // // @nodoc
  // create(model, options) => {
  //   let modelJson
  //   if (this.manual_id) => { return options.error(new Error(`Create should not be called for a manual id. Set an id before calling save. Model name: ${this.modelType.modelName}. Model: ${JSON.stringify(model.toJSON())}`)) }

  //   model.set(this.id_attribute, this.id_type === 'String' ? `${++this.id}` : ++this.id)
  //   this.store.splice(this.insertIndexOf(model.id), 0, (modelJson = model.toJSON()))
  //   return options.success(JSONUtils.deepClone(modelJson))
  // }

  // // @nodoc
  // update(model, options) => {
  //   let index
  //   const create = ((index = this.insertIndexOf(model.id)) >= this.store.length) || (this.store[index].id !== model.id)
  //   if (!this.manual_id && create) => { return options.error(new Error(`Update cannot create a new model without manual option. Set an id before calling save. Model name: ${this.modelType.modelName}. Model: ${JSON.stringify(model.toJSON())}`)) }

  //   const modelJson = model.toJSON()
  //   if (create) => { this.store.splice(index, 0, modelJson) }
  //   else { this.store[index] = modelJson }
  //   return options.success(JSONUtils.deepClone(modelJson))
  // }

  // // @nodoc
  // delete(model, options) => { return this.deleteCB(model, err => err ? options.error(err) : options.success()) }

  // // @nodoc
  // deleteCB(model, callback) => {
  //   let index
  //   if ((index = this.indexOf(model.id)) < 0) => { return callback(new Error(`Model not found. Type: ${this.modelType.modelName}. Id: ${model.id}`)) }
  //   const modelJson = this.store.splice(index, 1)
  //   return Utils.patchRemove(this.modelType, model, callback)
  // }

  // //##################################
  // // Backbone ORM - Class Extensions
  // //##################################

  // // @nodoc
  // resetSchema(options, callback) => { return this.destroy() }

  // // @nodoc
  // cursor(query) => { if (query == null) => { query = {} } return new MemoryCursor(query, _.pick(this, ['modelType', 'store'])) }

  // // @nodoc
  // destroy(query) => {
  //   if (arguments.length === 1) => { [query, callback] = Array.from([{}, query]) }

  //   if (JSONUtils.isEmptyObject(query)) => {
  //     return Utils.popEach(this.store, ((modelJson, callback) => Utils.patchRemove(this.modelType, modelJson, callback)), callback)
  //   }
  //   let isDone = false
  //   const cursor = this.modelType.cursor(query).limit(DESTROY_BATCH_LIMIT)
  //   var next = () => {
  //     return cursor.toJSON((err, models_json) => {
  //       if (err) => { return callback(err) }
  //       if (models_json.length === 0) => { return callback() }
  //       isDone = models_json.length < DESTROY_BATCH_LIMIT
  //       return Utils.each(models_json, this.deleteCB, (err) => { if (err || isDone) => { return callback(err) }  return next()  })
  //     })
  //   }
  //   return next()

}
