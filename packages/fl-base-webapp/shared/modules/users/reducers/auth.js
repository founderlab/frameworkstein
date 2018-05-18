import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { reducer as authReducer } from 'fl-auth-redux'


const defaultState = fromJS({
  errors: {},
})

export default function reducer(_state=defaultState, action={}) {
  let state = _state
  return authReducer(state, action)
}
