# Request middleware for Redux

Middleware for redux that provides a convention for working with async requests. Similar in philosophy and behavior to [redux-pack](https://github.com/lelandrichardson/redux-pack) which has a much nicer and more detailed writeup on why you might want to use a library like this.


requestMiddleware, responseParserMiddleware
-------------------------------------------

`requestMiddleware` looks for a `request` property on redux actions and attempts to resolve it. `request` can be a promise, fetch request or BackboneORM cursor object.

When a request is found the middleware will terminate the current action and dispatch the following (with `<TYPE>` being the original type property of the action)
`<TYPE>_START` is sent before resolving the request.
`<TYPE>_SUCCESS` is sent when the request has successfully resolved. The response is added to the current action as `res`.
`<TYPE>_ERROR` is sent when the request has failed. The response is added to the current action as `res`.

The middleware returns a promise which will get passed back to the dispatcher of the action. It is resolved when the request completes (after sending the *_SUCCESS or *_ERROR action). Alternatively you may add a `callback` property to an action which will be called at this time. Either way, the callback/promise is given the current action as a param.


`responseParserMiddleware` operates on data added to an action by `requestMiddleware`. It parses raw json from responses and adds the following properties to the current action:
```javascript
{
  models:       // a map of models in the form {id: <model>}
  modelList:    // always an array of models regardless of whether the response was an array or single object
  model:        // always a single model, equaivalent to models[0]
  status:       // status code of the request
  error:        // best guess at an error object if something went wrong
}
```


##### Usage

1. Add to your middleware
```javascript
import { createStore, applyMiddleware } from 'redux'
import { requestMiddleware, responseParserMiddleware } from 'redux-request-middleware'
import rootReducer from './reducers'

const store = createStore(
  rootReducer,
  applyMiddleware(requestMiddleware, responseParserMiddleware),
)
```

2. Add a `request` property to your actions that contains the request you want to dispatch

```javascript

// stein-fetch or any function returning a promise
dispatch({
  type: 'GET_TASKS',
  request: fetch('/api/tasks'),
})

// stein-orm
import Task from './models/Task'

dispatch({
  type: 'GET_TASKS',
  request: Task.cursor({active: true}),
})


requestModifierMiddleware
-------------------------

Functions to modify request actions before sending them.

Designed to work alongside `requestMiddleware` which will perform the request and dispatch the relevant (sub)-actions.

It must be included *before* `requestMiddleware` when combining middleware, otherwise the requests will be sent before it has a chance to alter the query.


#### Options

 - getValue(store):              A function that takes a store and returns a value object to append to the request. You need to supply this.

 - getRequest(action):           Return a request from an action, defaults to returning action.request

 - setValue(request, value):     A function that appends `value` to the request somehow. By default it's this:

```javascript
export function setValue(request, value) {
  if (_.isFunction(request.setHeaders)) {
    request.setHeaders(value.headers)
  }
  return request
}
```


##### Usage

This example creates middleware that adds a header with the current organisation id to requests

```javascript
const requestModifierMiddleware = createRequestModifierMiddleware({
  getValue: store => {
    const { auth } = store.getState()
    const value = {
      headers: {},
    }
    if (auth.get('organisation')) value.headers['x-organisation-id'] = auth.get('organisation').get('id')
    return value
  },
})
```

requestLoggerMiddleware
-----------------------
Auto logs all requests to the console.
Add to your redux middleware to have each request logged (useful for `react-native` debugging).
