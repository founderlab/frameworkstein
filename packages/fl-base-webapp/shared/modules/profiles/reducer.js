import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { createGroupByReducer, createPaginationReducer } from 'fl-redux-utils'
import { TYPES } from './actions'


const byUser = createGroupByReducer([TYPES.PROFILE_LOAD + '_SUCCESS'], profile => profile.user_id, {single: true})
const pagination = createPaginationReducer('PROFILE')

const defaultState = fromJS({
  loading: false,
  errors: {},

  models: {},
  active: null,
  pagination: pagination(),
  byUser: byUser(),
})


export default function reducer(state=defaultState, action={}) {

  switch (action.type) {
    case TYPES.PROFILE_LOAD + '_START':
    case TYPES.PROFILE_SAVE + '_START':
    case TYPES.PROFILE_CREATE + '_START':
      return state.merge({loading: true, errors: {}})

    case TYPES.PROFILE_LOAD + '_ERROR':
      return state.merge({loading: false, errors: {load: action.error}})
    case TYPES.PROFILE_SAVE + '_ERROR':
    case TYPES.PROFILE_CREATE + '_ERROR':
      return state.merge({loading: false, errors: {save: action.error}})

    case TYPES.PROFILE_LOAD + '_SUCCESS':
      const profiles = action.models
      const loadMerge = {
        models: profiles,
      }
      if (action.active) {
        loadMerge.active = action.model
      }

      return state.merge({
        loading: false,
        errors: {},
        byUser: byUser(state.get('byUser'), action),
        pagination: pagination(state.get('pagination'), action),
      }).mergeDeep(loadMerge)

    case TYPES.PROFILE_COUNT + '_SUCCESS':
      return state.merge({
        pagination: pagination(state.get('pagination'), action),
      })

    case TYPES.PROFILE_SAVE + '_SUCCESS':
      const profile = action.model
      const saveMerge = {
        models: state.get('models').merge({[profile.id]: profile}),
      }

      if (profile.id === state.get('active').get('id')) {
        // Update the active profile if it matches
        saveMerge.active = profile
      }

      return state.merge({loading: false, errors: {}}).merge(saveMerge)

    case TYPES.ACTIVE_PROFILE_SET:
      return state.merge({active: action.profile})

    default:
      return state
  }
}
