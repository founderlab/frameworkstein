import _ from 'lodash'
import { createSelector } from 'reselect'


function paginationState(state, paginateOn) {
  if (_.isFunction(paginateOn)) return paginateOn(state)
  return state[paginateOn]
}

const defaultSelect = () => {}
const defaults = {
  modelsName: 'models',
  paginationName: 'pagination',
}

export default function createPaginationSelector(paginateOn, selectState, _options) {
  if (_.isPlainObject(selectState) && !_options) {
    _options = selectState
    selectState = defaultSelect
  }
  if (!selectState) selectState = defaultSelect
  const options = _.defaults(_options || {}, defaults)

  const selector = createSelector([
    state => {
      const pState = paginationState(state, paginateOn)
      return pState && pState.get(options.modelsName)
    },
    state => {
      const pState = paginationState(state, paginateOn)
      if (!pState) return null
      if (options.getPagination) return options.getPagination(pState)
      return pState.get(options.paginationName)
    },
    (state, props) => options.cacheKey || (options.cacheKeyFromProps && options.cacheKeyFromProps(props)),
    (_, props) => props && (props.itemsPerPage || props.itemsPerChunk),
  ],
  (models, _pagination, cacheKey, _itemsPerPage) => {
    const cachedPagination = _pagination && _pagination.get('cache') && _pagination.get('cache').get(cacheKey)

    const results = {
      cached: !!cachedPagination,
      visibleItems: [],
      visibleIds: [],
      totalItems: 0,
      currentPage: 1,
    }
    const pagination = cachedPagination || _pagination
    if (!pagination) return results

    results.totalItems = +pagination.get('total')
    results.currentPage = +pagination.get('currentPage')
    const itemsPerPage = _itemsPerPage || options.perPage

    if (pagination.get('append')) {
      results.visibleIds = pagination.get('ids').toJSON()
      if (itemsPerPage) results.visibleIds = results.visibleIds.slice(0, itemsPerPage * results.currentPage)
    }
    else {
      const pageIdsIm = pagination.get('pages').get(pagination.get('currentPage').toString())
      if (pageIdsIm) results.visibleIds = pagination.get('pages').get(pagination.get('currentPage').toString()).toJSON()
    }

    _.forEach(results.visibleIds, id => {
      const m = models.get(id)
      m && results.visibleItems.push(m.toJSON())
    })

    return results
  })

  return selector
}
