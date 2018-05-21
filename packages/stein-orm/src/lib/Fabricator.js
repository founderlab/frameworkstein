import _ from 'lodash'
import Queue from 'queue-async'
import { promisify } from 'util'


// Fabricator to generate test data.
//
export default class Fabricator {

  // Create new models without saving them.
  //
  // @example
  //   Fabricator.create Thing, 200, {name: Fabricator.uniqueId('thing_'), createdDate: Fabricator.date}, (err, models) -> # do something
  //
  static new(modelType, count, data) {
    const results = []
    while (count-- > 0) {
      const attributes = {}
      for (const key in data) { const value = data[key]; attributes[key] = _.isFunction(value) ? value() : value }
      results.push(new modelType(attributes))
    }
    return results
  }

  // Create new models and save them.
  //
  static _create(modelType, count, data, callback) {
    const models = Fabricator.new(modelType, count, data)
    const queue = new Queue()
    models.forEach(model => queue.defer(callback => model.save(callback)))
    return queue.await(err => {
      callback(err, models)
    })
  }
  static create(modelType, count, data, callback) {
    if (callback) return this._create(modelType, count, data, callback)
    return promisify(this._create)(modelType, count, data)
  }

  // Return the same fixed value for each fabricated model
  //
  static value(value) {
    if (arguments.length === 0) { return undefined }
    return () => value
  }

  // Return the same fixed value for each fabricated model
  //
  static increment(value) {
    if (arguments.length === 0) { return undefined }
    return () => value++
  }

  // Return a unique string value for each fabricated model
  //
  // @overload uniqueId()
  //   Creates a unique id without a prefix
  //
  // @overload uniqueId(prefix)
  //   Creates a unique id with a prefix
  //
  static uniqueId(prefix) {
    if (arguments.length === 0) { return _.uniqueId() }
    return () => _.uniqueId(prefix)
  }

  // Return a date for each fabricated model
  //
  // @overload date()
  //   The current date/time
  //
  // @overload date(stepMs)
  //   Creates a new date/time for each call in fixed milliseconds from the date/time at the first call
  //
  // @overload date(start, stepMs)
  //   Creates a new date/time for each call in fixed milliseconds from a specified date/time
  static date(start, stepMs) {
    const now = new Date()
    if (arguments.length === 0) { return now }

    if (arguments.length === 1) { [start, stepMs] = Array.from([now, start]) }
    let current_ms = start.getTime()
    return function() {
      const current = new Date(current_ms)
      current_ms += stepMs
      return current
    }
  }
}
