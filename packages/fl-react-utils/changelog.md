
## [Unreleased]
  
## [0.15.22]
  - Bunch of bug fixes and minor improvements
  - Added the SplitDatetime compnent, which renders a datetime selector with separate inputs for date and time.

## [0.15.15]
  - Validation: Only show success validation for dirty fields
  - Validation: Form feedback only applies when the input is not active
  - Input: Form feedback is optional on (feedback={false} will disable it)

## [0.15.9]
  - Various bug fixes
  - Format initial values of date fields correctly

## [0.15.3]
  - react-select should correctly return a value rather than a {label, value} object
  - Updated pagination buttons for react-router-bootstraps api changes

## [0.15.0]
  - Cleaning up bits that have been moved elsewhere
  - Removed reducers (moved to `fl-redux-utils`) and middleware (fetchComponentData moved to `fetch-component-data` and requestModifier moved to `redux-request-middleware`)
  
## [0.14.0]
  - Added RadioField and Input components - helpers for use with redux-form and react-bootstrap
  
## [0.13.0]
  - Updated S3Image and S3Uploader to get urls from context
  
## [0.12.0]
  - Moved requestLoggerMiddleware to redux-request-middleware where it can be used with react-native

## [0.11.0]
  - `fetchComponentData` was moved to fl-utils
  - `groupByReducer` improvements
  - Started adding tests

## [0.10.5]
  - `groupByReducer` fix

## [0.10.4]
  - Package fixups, added .babelrc to .npmignore

## [0.10.3]
  - Added `requestModifierMiddleware` so you can mess with your requests before they're sent

## [0.10.2]
  - Single option added to `groupByReducer`. Set to true when creating the reducer to output a mapping of {id: target_id} rather than {id: [list_of_target_ids]}

## [0.10.0]
  - Code style switched to camelCase for variables. 
  - Frameworkstein initial release.

## [0.6.0]
  - Now an npm package
  - added requestLoggerMiddleware (moved from fl-auth-redux)

## [0.5.0]
  - Added Sidebar component

## [0.4.2]
  - Pass classNames to Pagination component

## [0.4.0]
  - Moved server renderer to fl-sever-utils

## [0.3.5]
  - Pagination links are real links

## [0.3.4]
  - added createPaginationSelector to auto create a `reselect` selector

## [0.3.3]
  - createServerRenderer takes an alwaysFetch parameter for components that should always have their 
  fetchData method called

## [0.3.2]
  - createGroupByReducer added

## [0.3.0]
  - Naming scheme updated; pagination added

## [0.2.0]
  - dispatchNeeds changed to fetchComponentData

## [0.1.0]
  - Yoinked things from fl-base-webapp

