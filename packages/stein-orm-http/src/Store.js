import _ from 'lodash'
import fetch from 'cross-fetch'
import qs from 'qs'
import HttpCursor from './Cursor'
import { config } from './config'


export default class HttpStore {

  constructor(modelType, options={}) {
    this.modelType = modelType
    this.url = options.url
    this.maxErrorMessageLength = options.maxErrorMessageLength || 100
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
    return new HttpCursor(query, {modelType: this.modelType, handleError: this.handleError})
  }

  /*
   * POST this model
   */
  create = async model => {
    const saveJson = model.toJSON()
    const res = await fetch(this.url, this.fetchOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveJson),
    }))
    if (!res.ok) return this.handleError(res, 'creating')
    return res.json()
  }

  /*
   * PUT this model
   */
  update = async model => {
    const saveJson = model.toJSON()
    const res = await fetch(this.modelUrl(model), this.fetchOptions({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveJson),
    }))
    if (!res.ok) return this.handleError(res, 'updating')
    return res.json()
  }

  /*
   * DELETE by query
   */
  destroy = async query => {
    const url = query.id ? `${this.modelType.url}/${query.id}` : `${this.modelType.url}?${qs.stringify(query)}`
    const res = await fetch(url, this.fetchOptions({
      method: 'DELETE',
    }))
    if (!res.ok) return this.handleError(res, 'deleting')
    return res.json()
  }

  handleError = async (res, action) => {
    let errorMessage = ''
    try {
      const json = await res.json()
      errorMessage = json.error
    }
    catch (err) {
      errorMessage = (await res.text() || res.status).slice(0, this.maxErrorMessageLength)
    }
    const err = new Error(`Error ${action} ${this.modelType.name} (${res.status}): ${errorMessage}`)
    err.status = res.status
    throw err
  }

}
