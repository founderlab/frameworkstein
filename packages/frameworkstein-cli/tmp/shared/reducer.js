import Immutable from 'immutable'
import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { reducer as admin } from 'fl-admin'
import { routerReducer } from 'react-router-redux'
import app from './modules/app/reducer'
import auth from './modules/users/reducers/auth'
import profiles from './modules/users/reducers/profiles'
import authors from './modules/authors/reducer'
import posts from './modules/posts/reducer'


export default combineReducers({
  app,
  auth,
  form,
  profiles,
  authors,
  posts,
  router: routerReducer,
  admin: admin || ((state=new Immutable.Map()) => state),
  config: (state=new Immutable.Map()) => state,
})
