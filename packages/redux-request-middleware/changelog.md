
## [Unreleased]
 
## [5.0.0]
  - Added to Frameworkstein
  - Updated for react-router v4
  - Supports promises / async


## [0.13.5]
  - Bug fixes
  - Fix retry check for status 4XX

## [0.13.0]
  - Added a retry option to request middleware. On by default, see readme.

## [0.12.6]
  - Added logging of errors.

## [0.12.2]
  - Added requestModifierMiddleware to allow altering requests before they're sent (moved here from fl-react-utils).

## [0.12.0]
  - Added requestLoggerMiddleware to help with react-native debugging (moved here from fl-react-utils).

## [0.11.3]
 - Back to Babel 5.

## [0.11.0]
  - Migrated to Babel 6.

## [0.10.0]
  - Code style switched to camelCase for variables.
  - Frameworkstein initial release.
  - The `by_id` property has been renamed to `models`. `models` has been renamed to `modelList`.

## [0.5.0]
  - Changed handling of null responses (again). They are now not considered an error.
  - The http status code is appended to the action when parsing the response.
  - A `model` prop is also added to the action which. It's null if no response is received.

## [0.4.6]
  - responseParser always parses ids to strings by default.

## [0.4.5]
  - Behave correctly when res is null (not undefined) with no error.

## [0.4.3]
  - Fixed up error handling a bit.

## [0.4.2]
  - responseParser also adds the models as a list. Format is {models: {model_map}, models: [modelList]}.

## [0.3.0]
  - responseParser middleware added to parse json / models into an {id: {model}} format.
