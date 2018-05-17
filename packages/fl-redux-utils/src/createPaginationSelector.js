import _ from 'lodash' // eslint-disable-line
import {createSelector} from 'reselect'

function paginationState(state, paginateOn) {
  if (_.isFunction(paginateOn)) return paginateOn(state)
  return state[paginateOn]
}

const defaultSelect = () => {}
const defaults = {
  modelsName: 'models',
  paginationName: 'pagination',
}

export default function createPaginationSelector(paginateOn, selectState=defaultSelect, _options={}) {
  const options = _.defaults(_options, defaults)

  const selector = createSelector(
    state => {
      const pState = paginationState(state, paginateOn)
      return pState && pState.get(options.modelsName)
    },
    state => {
      const pState = paginationState(state, paginateOn)
      return pState && pState.get(options.paginationName)
    },
    (models, pagination) => {
      const visibleItems = []

      const visibleIds = pagination ? pagination.get('visible').toJSON() : []
      const totalItems = pagination ? +pagination.get('total') : 0
      const currentPage = pagination ? +pagination.get('currentPage') : 1

      _.forEach(visibleIds, id => visibleItems.push(models.get(id).toJSON()))

      return {visibleItems, totalItems, currentPage}
    },
  )

  return state => {
    const selectedState = selector(state)
    return _.extend({}, selectState(state), selectedState)
  }
}
