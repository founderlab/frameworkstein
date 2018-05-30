import _ from 'lodash'
import qs from 'qs'
import fetch from 'cross-fetch'
import { Cursor } from 'stein-orm'
import querify from './querify'


export default class HttpCursor extends Cursor {
  constructor(...args) {
    super(...args)
    this.verbose = false
  }

  queryToJSON = async callback => {
    if (this.hasCursorQuery('$zero')) return callback(null, this.hasCursorQuery('$one') ? null : [])
    const query = querify(_.extend({}, this._find, this._cursor))

    try {
      const res = await fetch(`${this.modelType.store.urlRoot()}?${qs.stringify(query)}`, this.modelType.store.fetchOptions())
      if (res.status === '404' && query.$one) return callback(null, null)
      const json = await res.json()
      return callback(null, this.hasCursorQuery('$count') || this.hasCursorQuery('$exists') ? json.result : json)
    }
    catch (err) {
      return callback(err)
    }
  }
}
