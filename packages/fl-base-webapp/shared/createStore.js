import _ from 'lodash' // eslint-disable-line
import { createStore as _createStore, compose, applyMiddleware } from 'redux'
import { requestMiddleware, responseParserMiddleware, createRequestModifierMiddleware } from 'redux-request-middleware'
import { fetchComponentDataMiddleware } from 'fetch-component-data'
import { fromJS } from 'immutable'
import { routerMiddleware } from 'react-router-redux'
import { setHeaders } from './lib/headers'
import getRoutes from './routes'


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

// Add $user_id to queries
// Add the csrf token to superagent request headers
const requestModifierMiddleware = createRequestModifierMiddleware({
  setValue: (request, value) => {
    const {headers, ...query} = value
    if (_.isObject(request._cursor)) _.merge(request._cursor, query)
    if (_.isFunction(request.query)) request.query(query)
    if (_.isFunction(request.set) && headers) request.set(headers)
    return request
  },

  getValue: store => {
    const {auth} = store.getState()
    const value = {}
    if (auth.get('user')) value.$user_id = auth.get('user').get('id')
    if (auth.get('csrf')) value.headers = {'x-csrf-token': auth.get('csrf')}
    return value
  },
})

// Scroll to the top of the app container when the route changes
const locsEqual = (locA, locB) => (locA.pathname === locB.pathname) // && (locA.search === locB.search)
const scrollMiddleware = store => next => action => {
  const router = store.getState().router
  const ROUTER_DID_CHANGE = '@@reduxReactRouter/routerDidChange'
  if (typeof window === 'object' && action.type === ROUTER_DID_CHANGE && router && !locsEqual(action.payload.location, router.location)) {
    const scrollEle = document.getElementsByClassName('app-content')[0]
    if (scrollEle) {
      scrollEle.scrollTop = 0
      scrollEle.parentElement.scrollTop = 0
    }
  }
  return next(action)
}

const logRocketEnhancer = typeof window === 'object' && window.LogRocket ? window.LogRocket.reduxEnhancer({
  actionSanitizer: action => {
    const field = _.get(action, 'action.meta.field')
    if (field === 'password') return null
    return action
  },
}) : f => (a, b, c) => f(a, b, c)

// export default function createStore(reduxReactRouter, getRoutes, createHistory, _initialState) {
export default function createStore({initialState, history}) {
  const reducer = require('./reducer') // delay requiring reducers until needed
  const middlewares = applyMiddleware(
    requestModifierMiddleware,
    requestMiddleware,
    responseParserMiddleware,
    fetchComponentDataMiddleware(getRoutes),
    scrollMiddleware,
    routerMiddleware(history),
  )

  const finalCreateStore = compose(
    middlewares,
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f,
    logRocketEnhancer,
  )(_createStore)

  const _initialState = immute(initialState)
  const store = finalCreateStore(reducer, _initialState)

  setHeaders({'x-csrf-token': initialState.auth.csrf})
  return store
}
