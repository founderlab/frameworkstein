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
    const currentLocation = router.location

    if (currentLocation && _.includes(routeChangeTypes, action.type)) {
      const newLocation = (action.payload && action.payload.location) || action.payload
      if (locsEqual(currentLocation, newLocation)) return
      const branch = matchRoutes(routes, newLocation.pathname)

      fetchComponentData({store, branch, action, location: newLocation})
    }

    return next(action)
  }
}
