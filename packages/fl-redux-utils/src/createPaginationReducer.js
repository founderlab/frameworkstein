import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'


export default function createPaginationReducer(actionType, options={}) {

  const defaultState = fromJS({
    total: 0,
    currentPage: 0,
    pages: {},
    cache: {},
  })

  return function pagination(_state=defaultState, action={}) {
    let state = _state

    // Store the append option so selectors can see it
    if (options.append && !state.get('append')) {
      state = state.set('append', true)
    }

    if (action.type === actionType + '_COUNT_SUCCESS') {
      state = state.merge({total: +action.res})
    }

    else if (action.type === actionType + '_LOAD_SUCCESS' && !_.isNil(action.page)) {
      state = state.setIn(['pages', action.page.toString()], fromJS(action.ids))
      state = state.set('currentPage', action.page)
    }

    // Remove deleted items without clearing everything
    else if (action.type === actionType + '_DEL_SUCCESS') {
      const pages = state.get('pages').toJS()

      _.forEach(pages, (pageIds, page) => {
        pages[page] = _.without(pageIds, action.deletedId)
      })

      state = state.merge({pages, cache: {}})
    }

    // Clear all pagination and bail
    else if (action.type === actionType + '_SAVE_SUCCESS' || action.type === actionType + '_CLEAR') {
      return state.merge(defaultState.toJS())
    }

    // Restore state from cache key and bail
    else if (action.type === actionType + '_CACHE_RESTORE' && action.cacheKey) {
      const cachedState = state.get('cache').get(action.cacheKey) && state.get('cache').get(action.cacheKey).toJS()
      // Return here so we don't cached the cached result again
      return state.merge(cachedState)
    }

    // Clear cache and bail
    else if (action.type === actionType + '_CACHE_CLEAR') {
      return state.merge({cache: {}})
    }

    if (action.cacheKey) {
      const cachedState = {
        pages: state.get('pages').toJS(),
        total: state.get('total'),
        currentPage: state.get('currentPage'),
      }
      state = state.setIn(['cache', action.cacheKey], fromJS(cachedState))
    }

    return state
  }
}
