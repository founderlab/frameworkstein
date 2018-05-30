# fetch-component-data
Data fetching helper and Redux middlware for React components in Frameworkstein apps


fetchComponentDataMiddleware
------------------

Redux middleware to ensure container components get a chance to load their data when they're mounted.
Detects `redux-router` or `react-router-redux` route change actions and calls `fetchComponentData` on the component of the route that is being navigated to.

This middleware is much the same as adding a call to `fetchData` in each component's `componentDidMount` function.


fetchComponentData
------------------

Calls Component.fetchData on a list of React Components. Used to tie in the data loading story for Frameworkstein.

Best used in conjunction with [redux-request-middleware](https://github.com/frameworkstein/redux-request-middleware) or another method of returning a promise from dispatched actions. See there for more detailed docs.

Used internally by `fl-react-server`. 

There's no magic here, just a convenience function that enforces the `fetchData` convention.



```javascript
// MyPage.js

export default class MyPage extends React.Component {

  // Middleware will call this method on each route change
  // The store is provided, we can get the current state of the router from it via redux-router
  // We'll also need its dispatch method to dipatch actions from here
  // May return a promise or call the given callback function. Only useful if doing server side rendering, so the server renderer can delay rendering the page until the component has finished loading its data.
  static fetchData({store, action}/*, callback*/) {

    // As is the current action if we're transitioning between routes. 'action.payload' contains the props for the route we're transitioning to. Here for example we're getting router.params.id from it
    const { router } = store.getState()
    const id = ((action && action.payload && action.payload.params) || router.params).id
    
    // Assuming we're using redux-request-middleware to return a promise when dispatching this action
    return store.dispatch(loadMyPageContent())
  }

  // ...rest of the component goes below

  render() {
    // ...etc
  }
}
```
