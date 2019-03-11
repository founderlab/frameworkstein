
# Requests



## Requests

There are two parts to the Frameworkstein data loading story: [fetching data](/fetch-data) for components when they load (routes in particular) and helpers for loading data with redux actions.

We'll look at redux actions and [redux-request-middleware](https://github.com/founderlab/redux-request-middleware) first.

#### How it works

After adding the middleware to redux, we can add a `request` property to redux actions. The middleware will run this request and dispatch an action when the request starts, completes or error.

```javascript
// actions.js
// ----------


// A stein-orm model
import Task from './models/Task'

export function loadTasks() {
  return {
    type: 'GET_TASKS',
    request: Task.cursor({active: true}),
  }
}

// A function returning a promise, like fetch
export function loadTasks() {
  return {
    type: 'GET_TASKS',
    request: fetch('/api/tasks'),
  }
}

// An async function
export function loadTasks() {
  return {
    type: 'GET_TASKS',
    request: async () => {
      const tasks = await someLoadTasksFunction()
      const laterTasks = await loadSomeMoreTasks()
      return [...tasks, ...laterTasks]
    },
  }
}

// A custom function that takes a callback
export function loadTasks(callback) {
  return {
    type: 'GET_TASKS',
    request: callback => loadSomeThingsManually(callback),
    callback, // This will be called when the request completes. Useful for navigating after a request returns (login, etc)
  }
}

// A Superagent request
import request from superagent

export function loadTasks(callback) {
  return {
    type: 'GET_TASKS',
    request: request.get('/api/tasks'),
    callback, 
  }
}

```

The code above will dispatch the following:

`GET_TASKS_START` when the request is started. The action hs no extra information added at this point - it's the same as the one returned by the action creator.

`GET_TASKS_SUCCESS` when the requests completes with no error. The middleware adds the following properties to the action:

  - `model` the model loaded (defaults to the first model if a json array was received).

  - `models` an `{id: model}` map of loaded models. Each key is one models id, value is the model.

  - `modelList` an array of models loaded.

  - `ids` an array of only the ids of the models.

  - `status` status code of the response.

  - `res` the raw response received form running the request.

`GET_TASKS_ERROR` when the requests completes with an error. The action has an `error` property added with the error encountered.

An example reducer to handle the above actions would look like:

```javascript
//reducer.js
// ---------

const defaultState = {
  loading: false,
  models: {},
  modelList: [],
  error: null,
}

export default function reducer(state=defaultState, action={}) {
  switch (action.type) {
    case TYPES.GET_TASKS + '_START':
      return {loading: true, error: null, ...state}

    case TYPES.GET_TASKS + '_ERROR':
      return {loading: false, error: action.error, ...state}

    case TYPES.GET_TASKS + '_SUCCESS':
      return {
        loading: false,
        error: null,
        models: action.models,
        modelsList: action.modelList,
        ...state,
      })

    default:
      return state
  }
}

```
