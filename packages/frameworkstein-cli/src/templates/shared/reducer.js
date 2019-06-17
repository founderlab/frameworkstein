
export default options =>
`import Immutable from 'immutable'
import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import { reducer as admin } from 'fl-admin'
import { routerReducer } from 'react-router-redux'
import app from './modules/app/reducer'
import auth from './modules/users/reducers/auth'
import profiles from './modules/users/reducers/profiles'
${options.models.map(modelOption => (`import ${modelOption.variablePlural} from './modules/${modelOption.variablePlural}/reducer'
`)).join('')}

export default combineReducers({
  app,
  auth,
  form,
  profiles,${options.models.map(modelOption => (`
  ${modelOption.variablePlural},`
)).join('')}
  router: routerReducer,
  admin: admin || ((state=new Immutable.Map()) => state),
  config: (state=new Immutable.Map()) => state,
})
`
