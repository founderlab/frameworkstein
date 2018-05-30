import _ from 'lodash'

// Serialze json to a strict-JSON query format
//
// @example
//   query = querify(json)
//
export default function querify(json) {
  const query = {}
  _.forEach(json, (value, key) => query[key] = JSON.stringify(value))
  return query
}
