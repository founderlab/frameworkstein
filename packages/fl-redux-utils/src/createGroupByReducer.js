import _ from 'lodash'
import warning from 'warning'
import { Set, List, fromJS } from 'immutable'
import actionTypes from './actionTypes'


export default function createGroupByReducer(_actionTypes, groupingKey, options={}) {
  const defaultState = fromJS({})
  const { loadActions, deleteActions } = actionTypes(_actionTypes)

  const keyFn = options.keyFn || (val => val ? val.toString() : null)

  return function groupBy(_state=defaultState, action={}) {
    let state = _state

    if (deleteActions && _.includes(deleteActions, action.type)) {
      const id = action.deletedModel.id.toString()
      const _key = groupingKey(action.deletedModel)
      const key = keyFn(_key)
      const current = state.get(key)

      if (_.isNil(key)) {
        warning(false, `[fl-redux-utils] groupByReducer: groupingKey(action.deletedModel) was ${key} for deleted model ${JSON.stringify(action.deletedModel)}`)
      }
      else if (!current) {
        warning(false, `[fl-redux-utils] groupByReducer: state.get(key) doesnt exist for key ${key} from deleted model ${JSON.stringify(action.deletedModel)}`)
      }
      else if (options.single) {
        return state.merge({[key]: null})
      }
      else {
        const set = Set.isSet(current) ? current : new Set(current || [])
        return state.merge({[key]: set.remove(id)})
      }
    }

    else if (loadActions && _.includes(loadActions, action.type)) {
      const byGroup = _.groupBy(action.models, model => groupingKey(model))
      if (options.keyFromAction) {
        state = state.merge({[options.keyFromAction(action)]: new Set()})
      }

      _.forEach(byGroup, (models, _key) => {
        if (_.isNil(_key)) return
        const key = keyFn(_key)
        let groupState

        if (options.single) {
          groupState = models[0] ? models[0].id.toString() : null
        }
        else {
          groupState = state.get(key) || new Set()
          if (List.isList(groupState)) groupState = new Set(groupState.toJSON())

          _.forEach(models, model => {
            const id = model.id.toString()
            if (!groupState.includes(id)) groupState = groupState.add(id)
          })
        }
        state = state.merge({[key]: groupState})
      })
    }

    return state
  }
}
