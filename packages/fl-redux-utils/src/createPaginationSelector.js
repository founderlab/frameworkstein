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

      if (options.cacheKeyFromProps && props) {
        const cacheKey = options.cacheKeyFromProps(props)
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
      const visibleItems = []

      const visibleIds = pagination ? pagination.get('visible').toJSON() : []
      const totalItems = pagination ? +pagination.get('total') : 0
      const currentPage = pagination ? +pagination.get('currentPage') : 1

      _.forEach(visibleIds, id => {
        const m = models.get(id)
        m && visibleItems.push(m.toJSON())
      })

      return {visibleItems, totalItems, currentPage, cached}
    },
  )

  return state => {
    const selectedState = selector(state)
    return _.extend({}, selectState(state), selectedState)
  }
}
