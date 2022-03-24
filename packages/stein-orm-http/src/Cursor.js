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

  queryToJSON = async callback => {
    if (this.hasCursorQuery('$zero')) return callback(null, this.hasCursorQuery('$one') ? null : [])

    const query = querify({...this._find, ...this._cursor})
    let json

    try {
      const fetchOptions = this.modelType.store.fetchOptions()
      fetchOptions.headers = {...(fetchOptions.headers || {}), ...this._headers}
      const res = await fetch(`${this.modelType.store.urlRoot()}?${qs.stringify(query)}`, fetchOptions)
      if (res.status.toString() === '404' && query.$one) {
        return callback(null, null)
      }
      json = await res.json()
    }
    catch (err) {
      return callback(err)
    }
    return callback(null, this.hasCursorQuery('$count') || this.hasCursorQuery('$exists') ? json.result : json)
  }
}
