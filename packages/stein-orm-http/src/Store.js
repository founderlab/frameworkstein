import _ from 'lodash'
import fetch from 'cross-fetch'
import qs from 'qs'
import { promisify } from 'util'
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

  modelUrl = model => {
    if (!model.id) return this.urlRoot()
    let prefix = this.urlRoot()
    if (prefix.endsWith('/')) prefix = prefix.slice(0, prefix.length-1)
    return `${prefix}/${model.id}`
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
  _create = async (model, callback) => {
    const saveJson = model.toJSON()

    try {
      const res = await fetch(this.url, this.fetchOptions({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveJson),
      }))
      const json = await res.json()
      if (res.status !== 200) {
        const err = new Error(json.error || `Error creating model (${res.status}): ${json.error}`)
        err.status = res.status
        return callback(err)
      }
      return callback(null, json)
    }
    catch (err) {
      callback(err)
    }
  }
  create = (model, callback) => callback ? this._create(model, callback) : promisify(this._create)(model)

  /*
   * PUT this model
   */
  _update = async (model, callback) => {
    const saveJson = model.toJSON()

    try {
      const res = await fetch(this.modelUrl(model), this.fetchOptions({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveJson),
      }))
      const json = await res.json()
      if (res.status !== 200) {
        const err = new Error(json.error || `Error updating model (${res.status}): ${json.error}`)
        err.status = res.status
        return callback(err)
      }
      return callback(null, json)
    }
    catch (err) {
      callback(err)
    }
  }
  update = (model, callback) => callback ? this._update(model, callback) : promisify(this._update)(model)

  /*
   * DELETE by query
   */
  _destroy = async (query, callback) => {

    try {
      const url = query.id ? `${this.modelType.url}/${query.id}` : `${this.modelType.url}?${qs.stringify(query)}`
      const res = await fetch(url, this.fetchOptions({
        method: 'DELETE',
      }))
      const json = await res.json()
      if (res.status !== 200) {
        const err = new Error(json.error || `Error deleting model (${res.status}): ${json.error}`)
        err.status = res.status
        return callback(err)
      }
      return callback(null, json)
    }
    catch (err) {
      callback(err)
    }
  }
  destroy = (query, callback) => callback ? this._destroy(query, callback) : promisify(this._destroy)(query)

}
