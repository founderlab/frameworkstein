import _ from 'lodash'
import { matchRoutes } from 'react-router-config'
import fetchComponentData from './fetchComponentData'

const routeChangeTypes = [
  '@@reduxReactRouter/routerDidChange',
  '@@router/LOCATION_CHANGE',
]

const locsEqual = (locA, locB) => locA && locB && (locA.pathname === locB.pathname) && (locA.search === locB.search)

export default function createFetchComponentDataMiddlware(getRoutes) {
  const routes = getRoutes()

  return store => next => action => {
    const router = store.getState().router

    if (router.location && _.includes(routeChangeTypes, action.type)) {
      if (locsEqual(action.payload.location, router.location)) return
      const branch = matchRoutes(routes, action.payload.pathname)
      const components = _.uniq(_.map(branch, b => b.route.component))

      fetchComponentData({store, components, action})
    }

    next(action)
  }
}
