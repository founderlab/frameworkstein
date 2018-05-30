import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'

export default function createPaginationReducer(actionType, options={}) {

  const defaultState = fromJS({
    visible: [],
    total: 0,
    currentPage: 0,
  })

  return function pagination(_state=defaultState, action={}) {
    let state = _state

    if (action.type === actionType + '_COUNT_SUCCESS') {
      state = state.merge({total: +action.res})
    }

    else if (action.type === actionType + '_DEL_SUCCESS') {
      const visible = state.get('visible').toJSON()
      state = state.merge({visible: _.without(visible, action.deletedId)})
    }

    else if (action.type === actionType + '_LOAD_SUCCESS' && action.page) {
      if (options.append && action.page > +state.get('currentPage')) {
        // Only append if the page being loaded is higher than the current page
        // If a lower number assume it's a refresh and behave as if append was not set
        const current = state.get('visible').toJSON()
        state = state.merge({visible: current.concat(action.ids), currentPage: action.page})
      }
      else {
        state = state.merge({visible: action.ids, currentPage: action.page})
      }
    }

    return state
  }
}
