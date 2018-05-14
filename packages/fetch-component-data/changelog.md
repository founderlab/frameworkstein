## [0.5.0]
  - Update to use `react-router` v4 and `react-router-redux`. No longer supports `redux-router`. `fechComponentDataMiddleware` is now a function that must be called with a `getRoutes` param to create the middleware, see readme for example.

## [0.3.0]
  - Moved here from `fl-redux-utils` and `fl-utils`

## [0.2.0]
  - Added a parallelism option to fetchComponentData. Default is 1, meaning components will have their fetchData methods called in series rather than in parallel by default. This makes it easier to have one 'always fetch' component grab any required data for the rest of the app.

## [0.1.1]
  - Added observeStore

## [0.1.0]
 - Split out fetchComponentData from fl-react-utils
