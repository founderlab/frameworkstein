// accessTokenMiddleware appends an access token to any superagent request it finds on an action
// It's designed to work alongside requestMiddleware which will perform the requests and dispatch the relevant (sub)-actions
// It must be included *before* redux-request-middleware when combining middleware
// Otherwise the requests will be sent before it has a chance to attach the token

// options:
//  getRequest(action):           Return a request from an action, defaults to returning action.request
//  getToken(store):              A function that returns an access token given a redux store.
//                                By default it'll look for it on a property called `auth`.
//  appendToken(request, token):  Function to append a token to the request. Builtin options are appendTokenHeader and appendTokenQuery
//                    appendTokenHeader (default): token is added to the request header as a bearer token with `request.set({authorization: `Bearer ${accessToken}`})`
//                    appendTokenQuery: token is added to the query string as `request.query({$accessToken: accessToken})`
import _ from 'lodash'

export function getToken(store) {
  const auth = store.getState().auth
  if (!auth) return null
  return auth.get ? auth.get('accessToken') : auth.accessToken
}

export function appendTokenHeader(request, accessToken) {
  request.set({authorization: `Bearer ${accessToken}`})
  return request
}

export function appendTokenQuery(request, accessToken) {
  request.query({$accessToken: accessToken})
  return request
}

const defaults = {
  getToken,
  getRequest: action => action.request,
  appendToken: appendTokenHeader,
}

export function createAccessTokenMiddleware(_options={}) {
  const options = _.merge(defaults, _options)

  return function accessTokenMiddleware(store) {
    return next => action => {

      const request = options.getRequest(action)
      const accessToken = options.getToken(store)
      if (request && accessToken) options.appendToken(request, accessToken)
      next(action)
    }
  }
}

export default createAccessTokenMiddleware()
