import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { TYPES } from '../actions'
import { removeModel, updateModel } from 'fl-redux-utils'

const defaultState = fromJS({
  loading: false,
  loaded: false,
  errors: {},
  models: {},
  modelList: [],
})

export default function reducer(state=defaultState, action={}) {

  switch (action.type) {
    case TYPES.TEST_MODEL_LOAD + '_START':
    case TYPES.TEST_MODEL_SAVE + '_START':
    case TYPES.TEST_MODEL_DELETE + '_START':
      return state.merge({loading: true, errors: {}})

    case TYPES.TEST_MODEL_LOAD + '_ERROR':
      return state.merge({loading: false, error: {load: action.error || action.res.error}})
    case TYPES.TEST_MODEL_SAVE + '_ERROR':
      return state.merge({loading: false, error: {save: action.error || action.res.error}})
    case TYPES.TEST_MODEL_DELETE + '_ERROR':
      return state.merge({loading: false, error: {delete: action.error || action.res.error}})

    case TYPES.TEST_MODEL_LOAD +'_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
        loaded: true,
      }).mergeDeep({
        models: action.models,
        modelList: action.modelList,
      })

    case TYPES.TEST_MODEL_SAVE + '_SUCCESS':
      return updateModel(state, action.model)

    case TYPES.TEST_MODEL_DELETE + '_SUCCESS':
      return removeModel(state, action.deletedModel.id)

    default:
      return state
  }
}
