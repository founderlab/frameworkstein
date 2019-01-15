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

      default:
        return state

    }
  }
}
