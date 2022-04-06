import qs from 'qs'
import fetch from 'cross-fetch'
import { Cursor } from 'stein-orm'
import querify from './querify'


export default class HttpCursor extends Cursor {
  constructor(...args) {
    super(...args)
    this._headers = {}
    this.verbose = false
  }

  setHeaders = headers => this._headers = headers

  _toJSON = async () => {
    if (this.hasCursorQuery('$zero')) return this.hasCursorQuery('$one') ? null : []

    const query = querify({...this._find, ...this._cursor})

    const fetchOptions = this.modelType.store.fetchOptions()
    fetchOptions.headers = {...(fetchOptions.headers || {}), ...this._headers}
    const res = await fetch(`${this.modelType.store.urlRoot()}?${qs.stringify(query)}`, fetchOptions)

    if (!res.ok) {
      if (res.status.toString() === '404') {
        if (query.$one) return null
      }
      return this.handleError(res, 'fetching')
    }

    const json = await res.json()
    return this.hasCursorQuery('$count') || this.hasCursorQuery('$exists') ? json.result : json
  }

  toJSON = async callback => {
    if (!callback) return this._toJSON()
    try {
      const res = await this.toJSON()
      return callback(null, res)
    }
    catch (err) {
      return callback(err)
    }
  }
}
