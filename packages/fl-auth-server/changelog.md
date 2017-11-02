
## [Unreleased]
  

## [0.14.0]
  - req.user deserializes to a plain js object rather than a Backbone model by default

## [0.13.0]
  - onLogin option for the facebook mobile strategy
  - Facebook mobile strategy now expects the request body to contain an object with `{accessToken, profile}` rather than just the `accessToken` object.

## [0.12.0]
  - Strategy for handling facebook logins from mobile apps
  - Fixed up casing on some files

## [0.11.0]
  - Internal auth middleware changes
    - Now accepts a deserializeUser function to load the user from the $user_id query param
    - No longer creates a dummy user

## [0.10.4]
  - Fixes for internal auth
  - The User model is added to req without toJSON
  - Dont mark the dummy internal user as an admin; handle this by loading the correct user via $user_id

## [0.10.0]
  - Code style switched to camelCase for variables. 
  - Frameworkstein initial release.

## [0.4.0]
  - Public release

## [0.3.2]
  - Register / login responses include all fields on the user model (except password)

## [0.3.1]
  - internalAuth can look up specific users now. It accepts a `User` argument, a user model class. If provided and `req.query.$user_id` is present on a request that user will be looked up. `req.user` will then be set to this user instance instead of the dummy user.

## [0.3.0]
  - Email confirmation is sent on registration. Configure the email sending via the sendConfirmationEmail option

## [0.2.0]
  - Extra params for registration can be configured. Authorised middleware delegates more to the canAccess option
