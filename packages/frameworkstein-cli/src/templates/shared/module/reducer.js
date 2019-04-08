export default options =>
`import _ from 'lodash' // eslint-disable-line
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
    case TYPES.${options.actionName}_LOAD + '_START':
    case TYPES.${options.actionName}_SAVE + '_START':
    case TYPES.${options.actionName}_DELETE + '_START':
      return state.merge({loading: true, errors: {}})

    case TYPES.${options.actionName}_LOAD + '_ERROR':
      return state.merge({loading: false, error: {load: action.error || action.res.error}})
    case TYPES.${options.actionName}_SAVE + '_ERROR':
      return state.merge({loading: false, error: {save: action.error || action.res.error}})
    case TYPES.${options.actionName}_DELETE + '_ERROR':
      return state.merge({loading: false, error: {delete: action.error || action.res.error}})

    case TYPES.${options.actionName}_LOAD +'_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
        loaded: true,
      }).mergeDeep({
        models: action.models,
        modelList: action.modelList,
      })

    case TYPES.${options.actionName}_SAVE + '_SUCCESS':
      return updateModel(state, action.model)

    case TYPES.${options.actionName}_DELETE + '_SUCCESS':
      return removeModel(state, action.deletedModel.id)

    default:
      return state
  }
}
`
