
# Requests



## Requests

There are two parts to the Frameworkstein data loading story: [fetching data](/fetch-data) for components when they load (routes in particular) and helpers for loading data with redux actions.

We'll look at redux actions and [redux-request-middleware](https://github.com/founderlab/redux-request-middleware) first.

#### How it works

After adding the middleware to redux, we can add a `request` property to redux actions. The middleware will run this request and dispatch an action when the request starts, completes or error.

```javascript
```

The code above will dispatch the following:

`GET_TASKS_START` when the request is started. The action hs no extra information added at this point - it's the same as the one returned by the action creator.

`GET_TASKS_SUCCESS` when the requests completes with no error. The middleware adds the following properties to the action:

`model` the model loaded (defaults to the first model if a json array was received)

`models` an {'{id: model}'} map of loaded models

`modelList` an array of models loaded

`ids` an array of the ids of the models

`status` status code of the response

`res` the response object

`GET_TASKS_ERROR` when the requests completes with an error. The action has an `error` property added with the error encountered.

An example reducer to handle the above actions would look like:

```javascript
```
