import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { createPaginationReducer } from 'fl-redux-utils'

export default function createReducer(modelAdmin) {

  const pagination = createPaginationReducer(modelAdmin.actionType)

  const p = pagination()
  const defaultState = fromJS({
    loading: false,
    errors: {},
    models: {},
    lastSaved: null,
    pagination: p,
  })

  return function reducer(state=defaultState, action={}) {

    switch (action.type) {
      case modelAdmin.actionType + '_LOAD_START':
      case modelAdmin.actionType + '_SAVE_START':
      case modelAdmin.actionType + '_DELETE_START':
        return state.merge({loading: true, errors: {}})

      case modelAdmin.actionType + '_LOAD_ERROR':
        return state.merge({loading: false, errors: {load: action.error || action.res.body.error}})
      case modelAdmin.actionType + '_SAVE_ERROR':
        return state.merge({loading: false, errors: {save: action.error || action.res.body.error}})
      case modelAdmin.actionType + '_DELETE_ERROR':
        return state.merge({loading: false, errors: {del: action.error || action.res.body.error}})

      case modelAdmin.actionType + '_COUNT_SUCCESS':
        return state.mergeDeep({
          pagination: pagination(state.get('pagination'), action),
        })

      case modelAdmin.actionType + '_LOAD_SUCCESS':
        return state.merge({
          loading: false,
          errors: {},
          pagination: pagination(state.get('pagination'), action),
        }).mergeDeep({
          models: action.models,
          modelIds: action.modelIds,
        })

      case modelAdmin.actionType + '_UPDATE':
        return state.mergeDeep({
          models: {
            [action.model.id]: action.model,
          },
        })

      case modelAdmin.actionType + '_SAVE_SUCCESS':
        return state.merge({
          loading: false,
          errors: {},
          lastSaved: action.model,
        }).mergeDeep({
          models: {
            [action.model.id]: action.model,
          },
        })

      case modelAdmin.actionType + '_DELETE_SUCCESS':
        const models = state.get('models').toJSON()
        delete models[action.deletedId]
        return state.merge({
          models,
          loading: false,
          errors: {},
          pagination: pagination(state.get('pagination'), action),
        })

      case modelAdmin.actionType + '_SET_RELATION_IDS':
        const { modelId, key, ids } = action
        return state.setIn(['models', modelId, key], ids)

      case modelAdmin.actionType + '_LINK_RELATION_START':
        return state.merge({
          errors: {},
        })
      case modelAdmin.actionType + '_LINK_RELATION_ERROR':
        return state.merge({loading: false, errors: {link: action.error || action.res.body.error}})

      case modelAdmin.actionType + '_LINK_RELATION_SUCCESS':
        const model = state.get('models').get(action.modelId).toJSON()
        model[action.idsKey] = _.uniq([...(model[action.idsKey] || []), action.relatedModelId])
        return state.setIn(['models', action.modelId], fromJS(model))

      case modelAdmin.actionType + '_UNLINK_RELATION_SUCCESS':
        const removingFromModel = state.get('models').get(action.modelId).toJSON()
        removingFromModel[action.idsKey] = _.without(removingFromModel[action.idsKey] || [], action.relatedModelId)
        return state.setIn(['models', action.modelId], fromJS(removingFromModel))

      default:
        return state

    }
  }
}
