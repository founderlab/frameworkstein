import _ from 'lodash'

export function setValue(request, value) {
  if (_.isObject(request._cursor)) {
    _.merge(request._cursor, value)
  }
  if (_.isFunction(request.query)) {
    request.query(value)
  }
  return request
}

const defaults = {
  getRequest: action => action.request,
  setValue,
}

export default function createRequestModifierMiddleware(_options={}) {
  const options = _.merge(defaults, _options)
  if (!options.getValue) return console.error('[redux-request-middleware] createRequestModifierMiddleware requires a getValue option')

  return function requestModifierMiddleware(store) {
    return next => action => {

      const request = options.getRequest(action)
      const value = options.getValue(store)
      if (request && value) options.setValue(request, value)

      next(action)
    }
  }
}
