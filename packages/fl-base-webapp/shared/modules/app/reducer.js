import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { TYPES } from './actions'

const defaultState = fromJS({
  pagesBySlug: {},
  staticPageLinks: {},
  settings: {},
  errors: {},
  loading: false,
})

export default function reducer(state=defaultState, action={}) {

  switch (action.type) {
    case TYPES.APP_SETTINGS_LOAD + '_START':
    case TYPES.STATIC_PAGE_LOAD + '_START':
      return state.merge({loading: true, errors: {}})

    case TYPES.APP_SETTINGS_LOAD + '_ERROR':
    case TYPES.STATIC_PAGE_LOAD + '_ERROR':
      return state.merge({loading: false, errors: {app: action.error || action.res.body.error}})

    case TYPES.APP_SETTINGS_LOAD +'_SUCCESS':
      return state.merge({
        loading: false,
        loaded: true,
        errors: {},
        staticPageLinks: action.model.staticPageLinks,
        settings: _.omit(action.model, 'staticPageLinks'),
      })

    default:
      return state
  }
}
