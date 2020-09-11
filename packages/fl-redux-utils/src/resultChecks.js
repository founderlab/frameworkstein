
export function hasResults(state, paginationName='pagination', options={}) {
  const { itemsPerPage } = options
  const page = options.page || 1

  if (itemsPerPage) {
    return state.get(paginationName) && state.get(paginationName).get('ids') && state.get(paginationName).get('ids').length >= page*itemsPerPage
  }

  return state.get(paginationName) && state.get(paginationName).get('pages') && state.get(paginationName).get('pages').get(page.toString())
}

export function hasCachedResults(state, cacheKey, paginationName='pagination') {
  return state.get(paginationName) && state.get(paginationName).get('cache') && state.get(paginationName).get('cache').get(cacheKey)
}
