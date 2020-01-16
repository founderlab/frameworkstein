import _ from 'lodash' // eslint-disable-line


export default function hasCachedResults(state, cacheKey, paginationName='pagination') {
  return state.get(paginationName) && state.get(paginationName).get('cache') && state.get(paginationName).get('cache').get(cacheKey)
}
