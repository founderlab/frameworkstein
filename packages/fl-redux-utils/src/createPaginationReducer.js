import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import actionTypes from './actionTypes'


export default function createPaginationReducer(_actionTypes, options={}) {
  const { loadActions, deleteActions, saveActions, countActions, clearActions, cacheRestoreActions, cacheClearActions, setPageActions } = actionTypes(_actionTypes)

  const defaultState = fromJS({
    total: 0,
    currentPage: 0,
    ids: [],
    pages: {},
    cache: {},
  })

  return function pagination(_state=defaultState, action={}) {
    let state = _state

    // Store the append option so selectors can see it
    if (options.append && !state.get('append')) {
      state = state.set('append', true)
    }

    if (_.includes(countActions, action.type)) {
      state = state.merge({total: +action.res})
    }

    else if (_.includes(loadActions, action.type) && !_.isNil(action.page)) {
      state = state.setIn(['pages', action.page.toString()], fromJS(action.ids))
      state = state.set('ids', fromJS(_.uniq([...state.get('ids'), ...action.ids])))
      state = state.set('currentPage', action.page)
    }

    // Remove deleted items without clearing everything
    else if (_.includes(deleteActions, action.type)) {
      const pages = state.get('pages').toJS()
      const deletedId = action.deletedId || (action.model && action.model.id) || (action.deletedModel && action.deletedModel.id)
      _.forEach(pages, (pageIds, page) => {
        pages[page] = _.without(pageIds, deletedId)
      })
      state = state.merge({pages, cache: {}})
    }

    // Clear all pagination and bail
    else if (_.includes([...saveActions, ...clearActions], action.type)) {
      return state.merge(defaultState.toJS())
    }

    // Restore state from cache key and bail
    else if (action.cacheKey && _.includes(cacheRestoreActions, action.type)) {
      const cachedState = state.get('cache').get(action.cacheKey) && state.get('cache').get(action.cacheKey).toJS()
      // Return here so we don't cached the cached result again
      return state.merge(cachedState)
    }

    // Clear cache and bail
    else if (_.includes(cacheClearActions, action.type)) {
      return state.merge({cache: {}})
    }

    // Clear cache and bail
    else if (_.includes(setPageActions, action.type)) {
      return state.set('currentPage', action.page)
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
