import { fromJS } from 'immutable'

const defaultState = fromJS({
  loading: false,
  errors: {},
})

export default function reducer(state=defaultState, action={}) {

  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'RESET_START':
    case 'RESET_REQUEST_START':
    case 'CONFIRM_EMAIL_START':
    case 'USER_UPDATE_START':
      return state.merge({loading: true, errors: {}, resetEmailSent: false})

    case 'LOGIN_ERROR':
      return state.merge({loading: false, errors: {login: action.error || action.res.error}})
    case 'REGISTER_ERROR':
      return state.merge({loading: false, errors: {register: action.error || action.res.error}})
    case 'RESET_ERROR':
      return state.merge({loading: false, errors: {reset: action.error || action.res.error}})
    case 'RESET_REQUEST_ERROR':
      return state.merge({loading: false, errors: {resetRequest: action.error || action.res.error}})
    case 'CONFIRM_EMAIL_ERROR':
      return state.merge({loading: false, errors: {confirmEmail: action.error || action.res.error}})
    case 'USER_UPDATE_ERROR':
      return state.merge({loading: false, errors: {userUpdate: action.error || action.res.error}})

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'RESET_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
        user: action.model.user,
        accessToken: action.model.accessToken,
      })
    case 'RESET_REQUEST_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
        resetEmailSent: true,
      })
    case 'CONFIRM_EMAIL_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
        emailConfirmed: true,
      })

    case 'USER_UPDATE_SUCCESS':
      return state.mergeDeep({
        loading: false,
        errors: {},
        user: action.model,
      })

    case 'LOGOUT':
      return defaultState

    default:
      return state

  }
}
