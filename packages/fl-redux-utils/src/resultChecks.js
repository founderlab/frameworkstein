
export function hasResults(state, paginationName='pagination', page=1) {
  return state.get(paginationName) && state.get(paginationName).get('pages') && state.get(paginationName).get('pages').get(page.toString())
}

export function hasCachedResults(state, cacheKey, paginationName='pagination') {
  return state.get(paginationName) && state.get(paginationName).get('cache') && state.get(paginationName).get('cache').get(cacheKey)
}
