import _ from 'lodash'

export function hasResults(state, getPagination='pagination', options={}) {
  const { itemsPerPage } = options
  const page = options.page || 1

  let pagination
  if (_.isFunction(getPagination)) pagination = getPagination(state)
  else pagination =  state.get(getPagination)

  if (itemsPerPage) {
    return pagination && pagination.get('ids') && pagination.get('ids').length >= page*itemsPerPage
  }

  return pagination && pagination.get('pages') && pagination.get('pages').get(page.toString())
}

export function hasCachedResults(state, cacheKey, getPagination='pagination') {
  let pagination
  if (_.isFunction(getPagination)) pagination = getPagination(state)
  else pagination =  state.get(getPagination)

  return pagination && pagination.get('cache') && pagination.get('cache').get(cacheKey)
}
