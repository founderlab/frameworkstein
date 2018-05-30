import _ from 'lodash'


export function deepClone(obj, depth) {
  let clone
  if (!obj || (typeof obj !== 'object')) { return obj }   // a value
  if (_.isString(obj)) { return String.prototype.slice.call(obj) } // a string
  if (_.isDate(obj)) { return new Date(obj.getTime()) }   // a date
  if (_.isFunction(obj.clone)) { return obj.clone() }     // a specialized clone function

  if (_.isArray(obj)) {                                 // an array
    clone = Array.prototype.slice.call(obj)
  }
  else if (obj.constructor !== {}.constructor) {       // a reference
    return obj
  }
  else {                                              // an object
    clone = _.extend({}, obj)
  }

  // keep cloning deeper
  if (!_.isUndefined(depth) && (depth > 0)) { for (const key in clone) { clone[key] = deepClone(clone[key], depth - 1) } }

  return clone
}

// @nodoc
export function stringify(json) {
  try { return JSON.stringify(json) }
  catch (err) { return 'Failed to stringify' }
}

// @nodoc
export function isEmptyObject(obj) { for (const key in obj) { return false } return true }

// Parse an object whose values are still JSON.
//
// @examples
//   date = parseDates('2014-08-21T17:48:01.971Z')
//   array = parseDates(['2014-08-21T17:48:01.971Z', '2014-08-21T17:48:01.971Z'])
//   object = parseDates({createdDate: '2014-08-21T17:48:01.971Z', changes: ['2014-08-21T17:48:01.971Z', '2014-08-21T17:48:01.971Z']})
//
export function parseDates(json) {
  if (_.isString(json)) {
    // Date: A trailing 'Z' means that the date will _always_ be parsed as UTC
    let date
    if ((json.length >= 20) && (json[json.length-1] === 'Z') && !_.isNaN((date = new Date(json)).getTime())) { return date }
  }
  else if (_.isObject(json) || _.isArray(json)) {
    for (const key in json) { const value = json[key]; json[key] = parseDates(value) }
  }
  return json
}

// Parse an object whose values are still JSON .
//
// @example
//   id = parseField(csvColumn[0], MyModel, 'id')
//
export function parseField(value, modelType, key) {
  const type = modelType && modelType.schema.type(key) && modelType.schema.type(key).toLowerCase()
  if (type !== 'integer') return parseDates(value)
  const intValue = +value
  if (!_.isNaN(intValue)) return intValue
  console.log(`Warning: failed to convert key: ${key} value: ${value} to integer. Model: ${modelType.modelName}`)
  return value
}

// Parse an object whose values types need to be inferred.
//
// @example
//   object = parse({id: csvColumn[0], createdDate: csvColumn[1]}, MyModel)
//   array = parse([{id: csvColumn[0], createdDate: csvColumn[1]]}, MyModel)
//
export function parse(obj, modelType) {
  let value
  if (!_.isObject(obj)) { return parseDates(obj) }
  if (_.isArray(obj)) {
    return ((() => {
      const result1 = []
      for (value of Array.from(obj)) {
        result1.push(parse(value, modelType))
      }
      return result1
    })())
  }
  const result = {}
  for (const key in obj) { value = obj[key]; result[key] = parseField(value, modelType, key) }
  return result
}

// Deserialze a strict-JSON query to a json format
//
// @example
//   json = parseQuery(query)
//
export function parseQuery(query) {
  const json = {}
  for (const key in query) {
    let value = query[key]
    json[key] = value
    if (_.isString(value) && value.length) { // needs parsing
      try { value = JSON.parse(value) }
      catch (error) {} // BE FORGIVING AND ALLOW FOR NON-QUOTED STRINGS DESPITE THE RISK OF INTEGER LOOKING STRINGS LIKE "12683162e63": catch err then console.log "Failed to JSON.parse query key: #{key} value: #{value}. Missing quotes on a string? Error: #{err.message}"
      json[key] = parseDates(value)
    }
  }
  return json
}
