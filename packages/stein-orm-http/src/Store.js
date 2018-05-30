import _ from 'lodash'
import fetch from 'cross-fetch'
import qs from 'qs'
import { promisify } from 'es6-promisify'
import HttpCursor from './Cursor'
import { config } from './config'


export default class HttpStore {

  constructor(modelType, options={}) {
    this.modelType = modelType
    this.url = options.url
    if (!this.url) throw new Error(`Missing url for model ${this.modelType.name}`)
  }

  urlRoot = () => {
    let prefix = config.baseUrl || ''
    if (prefix.endsWith('/')) prefix = prefix.slice(0, prefix.length-1)
    return `${prefix}${this.url}`
  }

  modelUrl = () => {
    if (!this.id) return this.urlRoot()
    let prefix = this.urlRoot()
    if (prefix.endsWith('/')) prefix = prefix.slice(0, prefix.length-1)
    return `${prefix}/${this.id}`
  }

  fetchOptions = (options={}) => _.merge(_.cloneDeep(config.fetch), options)

  /*
   * Return a http cursor for query building
   */
  cursor = (query={}) => {
    return new HttpCursor(query, {modelType: this.modelType})
  }

  /*
   * POST this model
   */
  _create = (model, callback) => {
    const json = model.toJSON()
    const saveJson = this.parseJSON(json)

    fetch(this.url, this.fetchOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveJson),
    }))
      .then(res => {
        const json = res.json()
        if (!res.status === 200) return callback(new Error(`Error creating model (${res.status}): ${json.error}`))
        return callback(null, json)
      })
      .catch(callback)
  }
  create = (model, callback) => callback ? this._create(model, callback) : promisify(this._create)(model)

  /*
   * PUT this model
   */
  _update = (model, callback) => {
    const json = model.toJSON()
    const saveJson = this.parseJSON(json)

    fetch(this.modelUrl(), this.fetchOptions({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveJson),
    }))
      .then(res => {
        const json = res.json()
        if (!res.status === 200) return callback(new Error(`Error updating model (${res.status}): ${json.error}`))
        return callback(null, json)
      })
      .catch(callback)
  }
  update = (model, callback) => callback ? this._update(model, callback) : promisify(this._update)(model)

  /*
   * DELETE a single model
   */
  _delete = (model, callback) => {
    fetch(this.modelUrl(), this.fetchOptions({
      method: 'DELETE',
    }))
      .then(res => {
        const json = res.json()
        if (!res.status === 200) return callback(new Error(`Error deleting model (${res.status}): ${json.error}`))
        return callback(null, json)
      })
      .catch(callback)
  }
  delete = (model, callback) => callback ? this._delete(model, callback) : promisify(this._delete)(model)

  /*
   * DELETE by query
   */
  _destroy = (query, callback) => {
    fetch(`${this.modelType.url}?${qs.stringify(query)}`, this.fetchOptions({
      method: 'DELETE',
    }))
      .then(res => {
        const json = res.json()
        if (!res.status === 200) return callback(new Error(`Error deleting model (${res.status}): ${json.error}`))
        return callback(null, json)
      })
      .catch(callback)
  }
  destroy = (query, callback) => callback ? this._destroy(query, callback) : promisify(this._destroy)(query)

}
