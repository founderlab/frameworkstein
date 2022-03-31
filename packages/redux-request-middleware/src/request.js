import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import retry from 'async-retry'


export function unpackAction(action) {
  const { request, callback, parseResponse, ...rest } = action
  return { request, callback, parseResponse, action: rest }
}

function shouldRetry(err) {
  const status = err.status
  // retry 5xx statuses
  return (status && status.toString()[0] === '5')
}

// Generate an error from a failed fetch request
async function handleFetchError(res) {
  let errorMessage = ''
  try {
    const json = await res.json()
    errorMessage = json.error
  }
  catch (err) {
    errorMessage = await res.text().slice(0, this.maxErrorMessageLength)
  }
  const err = new Error(`Error ${res.url} (${res.status}): ${errorMessage}`)
  err.status = res.status
  throw err
}

export async function executeRequest(request) {
  // Known api - orm
  if (request.toJSON) {
    return request.toJSON()
  }

  // Promise object, could be fetch or a custom async function
  const res = await request()

  // assume fetch result if a json() method is present
  if (isFunction(res.json)) {
    if (!res.ok) return handleFetchError(res)
    return res.json()
  }
  // otherwise just pass the result on
  return res
}

export async function executeRequestWithRetries(request, options) {
  let res
  if (options.retry) {
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
  suffixes: {
    START: '_START',
    ERROR: '_ERROR',
    SUCCESS: '_SUCCESS',
  },
  retry: {
    retries: 10,
  },
  shouldRetry,
}

export default function createRequestMiddleware(_options={}) {
  const options = {...defaults, ..._options}

  return function requestMiddleware() {
    return next => async action => processAction(next, action, options)
  }
}
