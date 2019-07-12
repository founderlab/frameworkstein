
export default options =>
`import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { removeModel, updateModel } from 'fl-redux-utils'
import { TYPES } from './actions'


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

    case TYPES.${options.actionName}_LOCAL_UPDATE:
      const uModel = state.get('models').get(action.model.id) && state.get('models').get(action.model.id).toJSON()
      if (!uModel) return state
      return state.setIn(['models', action.model.id], fromJS(_.merge(uModel, action.model)))

    case TYPES.${options.actionName}_LINK_RELATION + '_START':
      return state.merge({
        errors: {},
      })
    case TYPES.${options.actionName}_LINK_RELATION + '_ERROR':
      return state.merge({loading: false, errors: {link: action.error || action.res.body.error}})

    case TYPES.${options.actionName}_LINK_RELATION + '_SUCCESS':
      const model = state.get('models').get(action.modelId).toJSON()
      model[action.idsKey] = _.uniq([...(model[action.idsKey] || []), action.relatedModelId])
      return state.setIn(['models', action.modelId], fromJS(model))

    case TYPES.${options.actionName}_UNLINK_RELATION + '_SUCCESS':
      const removingFromModel = state.get('models').get(action.modelId).toJSON()
      removingFromModel[action.idsKey] = _.without(removingFromModel[action.idsKey] || [], action.relatedModelId)
      return state.setIn(['models', action.modelId], fromJS(removingFromModel))

    default:
      return state
  }
}
`
