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

  return createSelector(
    state => state[paginateOn].get(options.modelsName),
    state => state[paginateOn].get(options.paginationName),
    selectState,
    (models, pagination, selectedState) => {
      const visibleItems = []

      const visibleIds = pagination.get('visible').toJSON()
      const totalItems = +pagination.get('total')
      const currentPage = +pagination.get('currentPage')

      _.forEach(visibleIds, id => visibleItems.push(models.get(id).toJSON()))

      return _.extend({}, selectedState, {visibleItems, totalItems, currentPage})
    }
  )
}
