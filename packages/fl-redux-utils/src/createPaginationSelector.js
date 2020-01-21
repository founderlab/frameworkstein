import _ from 'lodash' // eslint-disable-line
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

  const selector = createSelector(
    state => {
      const pState = paginationState(state, paginateOn)
      return pState && pState.get(options.modelsName)
    },
    (state, props) => {
      let cached = false
      let pState = paginationState(state, paginateOn)
      if (!pState) return null

      if (options.cacheKey || (options.cacheKeyFromProps && props)) {
        const cacheKey = options.cacheKey || options.cacheKeyFromProps(props)
        const cachedState = pState.get(cacheKey)
        if (cachedState) pState = cachedState
        cached = true
      }

      return {
        cached,
        pagination: pState.get(options.paginationName),
      }
    },
    (models, {pagination, cached}) => {
      const results = {
        cached,
        visibleItems: [],
        visibleIds: [],
        totalItems: 0,
        currentPage: 1,
      }
      if (!pagination) return results

      results.totalItems = +pagination.get('total')
      results.currentPage = +pagination.get('currentPage')

      if (pagination.get('append')) {
        results.visibleIds = _(pagination.get('pages').toJSON()).values().flatten().value()
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
    },
  )

  return state => {
    const selectedState = selector(state)
    return _.extend({}, selectState(state), selectedState)
  }
}
