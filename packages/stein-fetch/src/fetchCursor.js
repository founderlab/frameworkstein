import _ from 'lodash'
import fetch from 'cross-fetch'
import qs from 'qs'
import handleFetchError from './handleFetchError'


const defaults = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
}

export class FetchCursor {

  constructor(path, options={}) {
    this.options = {...defaults, ...options}
    this._maxErrorMessageLength = options.maxErrorMessageLength || 100
    this._query = options.query
    this._urlRoot = options.urlRoot || ''
    this._headers = options.headers || {}
    this._body = options.body
    this._path = path
  }

  setHeaders = headers => {
    this._headers = headers
    return this
  }

  addHeaders = headers => {
    this._headers = {...this._headers, ...headers}
    return this
  }

  setQuery = query => {
    this._query = query
    return this
  }

  addQuery = query => {
    this._query = {...this._query || {}, ...query}
    return this
  }

  setUrlRoot = urlRoot => {
    this._urlRoot = urlRoot
    return this
  }

  url = () => {
    let url = `${this._urlRoot}${this._path}`
    const query = this._query
    if (query) {
      if (_.isString(query)) url += `?${query}`
      else if (_.isObject(query)) url += `?${qs.stringify(query)}`
    }
    return url
  }

  fetchOptions = () => {
    const opts = {
      ...this.options,
      headers: this._headers,
    }
    if (this._body) opts.body = _.isString(this._body) ? this._body : JSON.stringify(this._body)
    return opts
  }

  toJSON = async () => {
    const fetchOptions = this.fetchOptions()
    const res = await fetch(this.url(), fetchOptions)
    if (!res.ok) {
      return handleFetchError(res, {maxErrorMessageLength: this._maxErrorMessageLength, method: fetchOptions.method})
    }

    return res.json()
  }

  toJS = async (...args) => this.toJSON(...args)
}

export default function createFetchCursor(path, options) {
  return new FetchCursor(path, options)
}
