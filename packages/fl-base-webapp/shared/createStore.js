/* eslint-env browser */
import _ from 'lodash' // eslint-disable-line
import qs from 'qs'
import { createStore as _createStore, compose, applyMiddleware } from 'redux'
import { requestMiddleware, responseParserMiddleware, createRequestModifierMiddleware } from 'redux-request-middleware'
import { fetchComponentDataMiddleware } from 'fetch-component-data'
import { configure as configureStein } from 'stein-orm-http'
import { fromJS } from 'immutable'
import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux'


const MUTABLES = {
  router: 'always',
  admin: 1,
}

function immute(fromObj, parentKey, depth=0) {
  const obj = {}

  Object.keys(fromObj).forEach(key => {
    const mutableKey = parentKey || key
    const immuteAt = MUTABLES[mutableKey]

    if (!immuteAt || immuteAt === depth) {
      obj[key] = fromJS(fromObj[key])
    }
    else if (immuteAt > depth) {
      obj[key] = immute(fromObj[key], mutableKey, depth+1)
    }
    else obj[key] = fromObj[key]
  })

  return obj
}

// Add the csrf token to superagent request headers
const requestModifierMiddleware = createRequestModifierMiddleware({
  setValue: (request, value) => {
    const { headers, ...query } = value
    if (_.isObject(request._cursor)) _.merge(request._cursor, query)
    if (_.isFunction(request.query)) request.query(query)
    if (_.isFunction(request.set) && headers) request.set(headers)
    return request
  },

  getValue: store => {
    const { auth } = store.getState()
    const value = {}
    if (auth.get('csrf')) value.headers = {'x-csrf-token': auth.get('csrf')}
    return value
  },
})

// Scroll to the top of the app container when the route changes
const locsEqual = (locA, locB) => (locA && locB && locA.pathname === locB.pathname) // && locA.search == locB.search)

// Scroll to the top of the app container when the route changes
// Add parsed query to the react-router-redux lcoation object
const locationMiddleware = store => next => action => {
  const router = store.getState().router
  if (action.type === LOCATION_CHANGE) {
    if (router && !locsEqual(action.payload, router.location) && typeof window === 'object') {
      const scrollEle = document.getElementById('react-view')
      if (scrollEle) {
        scrollEle.scrollIntoView()
      }
    }
    action.payload.query = qs.parse(action.payload.search, {ignoreQueryPrefix: true})
  }
  next(action)
}

const logRocketEnhancer = typeof window === 'object' && window.LogRocket ? window.LogRocket.reduxEnhancer({
  actionSanitizer: action => {
    const field = _.get(action, 'action.meta.field')
    if (field === 'password') return null
    return action
  },
}) : f => (a, b, c) => f(a, b, c)

// export default function createStore(reduxReactRouter, getRoutes, createHistory, _initialState) {
export default function createStore({initialState, history, getRoutes}) {
  const reducer = require('./reducer') // delay requiring reducers until needed
  const middlewares = applyMiddleware(
    requestModifierMiddleware,
    requestMiddleware,
    responseParserMiddleware,
    fetchComponentDataMiddleware(getRoutes),
    locationMiddleware,
    routerMiddleware(history),
  )

  const finalCreateStore = compose(
    middlewares,
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
    logRocketEnhancer,
  )(_createStore)
  const _initialState = immute(initialState)
  const store = finalCreateStore(reducer, _initialState)

  const steinOptions = {
    baseUrl: initialState.config.url,
    fetch: {
      headers: {
        'x-csrf-token': initialState.auth.csrf,
      },
    },
  }
  if (initialState.auth.accessToken) steinOptions.fetch.headers.authorization = `Bearer ${initialState.auth.accessToken}`
  configureStein(steinOptions)

  return store
}
