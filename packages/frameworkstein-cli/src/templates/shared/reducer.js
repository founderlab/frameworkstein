
export default options =>
`import Immutable from 'immutable'
import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { reducer as admin } from 'fl-admin'
import { routerReducer } from 'react-router-redux'
import app from './modules/app/reducer'
import auth from './modules/users/reducers/auth'
import profiles from './modules/users/reducers/profiles'
import exampleModels from './modules/exampleModels/reducer'
import manyModels from './modules/manyModels/reducer'
import orders from './modules/orders/reducer'


export default combineReducers({
  app,
  auth,
  form,
  profiles,
  orders,
  exampleModels,
  manyModels,
  router: routerReducer,
  admin: admin || ((state=new Immutable.Map()) => state),
  config: (state=new Immutable.Map()) => state,
})
`
