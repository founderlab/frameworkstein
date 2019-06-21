import _ from 'lodash' // eslint-disable-line


export default function hasCachedResults(state, cacheKey) {
  return state.get('pagination') && state.get('pagination').get('cache') && state.get('pagination').get('cache').get(cacheKey)
}
