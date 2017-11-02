import expect from 'expect'
import {patchRouteEntry} from '../src'
import {makeHooksSafe} from '../src/patchRouteEntry'

describe('fl-react-utils', () => {

  it('patchRouteEntry creates a function', () => {
    const patcher = patchRouteEntry(() => {[]})
    expect(patcher).toBeA('function')
  })

  it('makeHooksSafe replaces the onEnter function of a route', () => {
    const onEnter = () => null
    const route = {onEnter}
    const routes = [{onEnter}]
    const withChildRoutes = {childRoutes: {onEnter}}
    const withIndexRoute = {indexRoute: {onEnter}}
    makeHooksSafe(route)
    makeHooksSafe(routes)
    makeHooksSafe(withChildRoutes)
    makeHooksSafe(withIndexRoute)
    expect(route.onEnter).toBeA('function').toNotEqual(onEnter)
    expect(routes[0].onEnter).toBeA('function').toNotEqual(onEnter)
    expect(withChildRoutes.childRoutes.onEnter).toBeA('function').toNotEqual(onEnter)
    expect(withIndexRoute.indexRoute.onEnter).toBeA('function').toNotEqual(onEnter)
  })

})
