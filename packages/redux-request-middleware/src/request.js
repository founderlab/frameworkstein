import isUndefined from 'lodash/isUndefined'
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import retry from 'async-retry'


export function unpackAction(action) {
  const { request, callback, parseResponse, ...rest } = action
  return {request, callback, parseResponse, action: rest}
}

// Try a bunch of stuff to extract an error message
export async function getErrorFromResponse(res) {
  if (isUndefined(res)) return '[redux-request-middleware] No response received'
  if (!res) return null
  if (res.body && res.body.error) return res.body.error
  if (res.error) return res.error
  if (res.ok === false) {
    let json = ''
    try {
      json = await res.json()
      // Replace the json functionto avoid the fetch response throwing an error when calling res.json() more than once
      res.json = () => json
    }
    catch (err) {
      // pass
    }
    return res.body || json.error || json.err || json || res.status || '[redux-request-middleware] Unknown error: res.ok was false'
  }
  return null
}

export async function executeRequestWithRetries(request, options) {
  let res
  if (options.retry) {
    options.retry.retries = options.retry.times ? (options.retry.times-1) : options.retry.retries // legacy api
    await retry(async bail => {
      try {
        res = await options.executeRequest(request)
      }
      catch (err) {
        if (!options.shouldRetry(err)) return bail(err)
        throw new Error(err)
      }
    }, options.retry)
  }
  else {
    res = await options.executeRequest(request)
  }
  return res
}

export function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    let done = false

    const p = request((err, res) => {
      if (done) return
      done = true
      if (err && res && !err.status) {
        err.status = res.status
      }
      if (err) return reject(err)
      resolve(res)
    })

    if (p && p.then) {
      p.then(res => {
        if (done) return
        done = true
        resolve(res)
      }).catch(err => {
        if (done) return
        done = true
        reject(err)
      })
    }
  })
}

export async function executeRequest(request) {
  let res
  try {
    // Known api - orm
    if (request.toJSON) {
      res = await request.toJSON()
    }
    // End function
    else if (isFunction(request.end)) {
      res = await promisifyRequest(request.end.bind(request))
    }
    // Callback function
    else if (isFunction(request)) {
      res = await promisifyRequest(request)
    }

    const errorText = await getErrorFromResponse(res)
    if (errorText) {
      const err = new Error(errorText)
      err.status = res && res.status
      throw err
    }

    return res
  }
  catch (err) {
    if (err.text) {
      let json
      try {
        json = JSON.parse(err.text)
      }
      catch (e) {
        // noop
      }
      if (json && json.error) throw new Error(json.error)
    }
    throw err
  }
}

export async function processAction(next, _action, options) {
  const { request, callback, parseResponse, action } = options.unpackAction(_action)
  if (!request || !(isFunction(request) || isObject(request))) return next(action)

  const { type, ...rest } = action
  const START = type + options.suffixes.START
  const ERROR = type + options.suffixes.ERROR
  const SUCCESS = type + options.suffixes.SUCCESS

  next({type: START, ...rest})

  let finalAction = {}
  let error
  try {
    const res = await executeRequestWithRetries(request, options)
    finalAction = {res, type: SUCCESS, ...rest}
    if (parseResponse) finalAction = parseResponse(finalAction)
  }
  catch (err) {
    error = err
    finalAction = {error: err, type: ERROR, ...rest}
  }

  try {
    await next(finalAction)
  }
  catch (err) {
    console.log('[redux-request-middleware] Error from a callback or reducer processing the requested action', action)
    console.log(err)
  }

  // Return the final action for the benefit of components dispatching the action
  if (callback && isFunction(callback))  {
    return callback(error, finalAction)
  }
  if (error) throw error
  return finalAction
}

const defaults = {
  unpackAction,
  executeRequest,
  getErrorFromResponse,
  suffixes: {
    START: '_START',
    ERROR: '_ERROR',
    SUCCESS: '_SUCCESS',
  },
  retry: {
    retries: 10,
  },
  shouldRetry: err => {
    const status = err.status
    if (status && status.toString()[0] === '4' || status === 500) return true
    if (err.toString().match(/status (4|500)/)) return true
    return false
  },
}

export default function createRequestMiddleware(_options={}) {
  const options = {...defaults, ..._options}

  return function requestMiddleware() {
    return next => async _action => {

      return processAction(next, _action, options)
    }
  }
}
