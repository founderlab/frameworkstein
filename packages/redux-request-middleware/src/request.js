import _ from 'lodash'
import retry from 'retry-unless'


export function extractRequest(action) {
  const {request, callback, parseResponse, ...rest} = action
  return {request, callback, parseResponse, action: rest}
}

export function getEndFn(request) {
  if (!request) return null

  // Known api - superagent or orm
  for (const methodName of ['toJSON', 'end']) {
    const end = request[methodName]
    if (_.isFunction(end)) return end.bind(request)
  }

  // Promise
  if (_.isFunction(request.then)) return callback => request.then(res => callback(null, res)).catch(callback)

  // Callback function
  if (_.isFunction(request)) return request

  return null
}

export function getError(err, res) {
  if (err) {
    if (err.text) {
      let json
      try {
        json = JSON.parse(err.text)
      }
      catch (e) {
        // noop
      }
      if (json && json.error) return json.error
    }
    return err
  }
  if (_.isUndefined(res)) return '[redux-request-middleware] No response received'
  if (!res) return null
  if (res.body && res.body.error) return res.body.error
  if (res.ok === false) return res.body || res.status || '[redux-request-middleware] Unknown error: res.ok was false'
  return null
}

const defaults = {
  extractRequest,
  getEndFn,
  getError,
  suffixes: {
    START: '_START',
    ERROR: '_ERROR',
    SUCCESS: '_SUCCESS',
  },
  retry: {
    times: 20,
    interval: retryCount => Math.min(50 * (2**retryCount), 1000),
  },
  check: err => {
    const status = err.status
    if (status && status.toString()[0] === '4' || status === 500) return true
    if (err.toString().match(/status (4|500)/)) return true
    return false
  },
}

// Wrap the end function to place the error status code on it if not present
const wrapEnd = endFn => callback => {
  endFn((err, res) => {
    if (err && res && !err.status) {
      err.status = res.status
    }
    callback(err, res)
  })
}

export default function createRequestMiddleware(_options={}) {
  const options = _.merge({}, defaults, _options)

  return function requestMiddleware() {
    return next => _action => {

      const {request, callback, parseResponse, action} = options.extractRequest(_action)
      const end = options.getEndFn(request)
      if (!end) return next(action)

      const {type, ...rest} = action
      const START = type + options.suffixes.START
      const ERROR = type + options.suffixes.ERROR
      const SUCCESS = type + options.suffixes.SUCCESS

      next({type: START, ...rest})

      return new Promise((resolve, reject) => {
        const done = (err, res) => {
          const error = options.getError(err, res)
          let finalAction = {}
          if (error) {
            finalAction = {res, error, type: ERROR, ...rest}
          }
          else {
            finalAction = {res, type: SUCCESS, ...rest}
            if (parseResponse) finalAction = parseResponse(finalAction)
          }
          next(finalAction)
          if (callback) callback(error, finalAction)
          if (error) reject(error)
          else resolve(finalAction)
        }

        if (options.retry) {
          return retry(options.retry, wrapEnd(end), options.check, done)
        }
        return end(done)
      })
    }
  }
}
