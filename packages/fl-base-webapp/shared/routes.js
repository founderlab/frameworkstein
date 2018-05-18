import React from 'react'
// import { Route, IndexRoute } from 'react-router'
// import { AdminRoute } from 'fl-admin'
import { routes as adminRoutes } from 'fl-admin'
import { Route, Switch } from 'react-router-dom'


export default function getRoutes(store) {

  const loginUrl = nextState => `/login?returnTo=${nextState.location.pathname}`
  const registerUrl = nextState => `/register?returnTo=${nextState.location.pathname}`

  /**
   * Continues if the state passes the checkFn, redirects to login otherwise
   * @param  {function} checkFn - function to check the state
   * @return {bool} - whether the state has passed the check
   */
  function checkStateFn(checkFn, redirectUrlFn=loginUrl) {
    return (nextState, replace, callback) => {
      if (!checkFn(store.getState())) {
        replace(redirectUrlFn(nextState))
      }
      callback()
    }
  }

  /**
   * Returns true if the user exists, and passes an optional checkFn
   * @param  {function} checkFn - optional function to check the user
   * @return {bool} - whether the state has passed the user check
   */
  function requireUserFn(checkFn, redirectUrlFn=loginUrl) {
    const checkUser = (state) => {
      const {auth} = state
      const user = auth.get('user')
      return user && (!checkFn || checkFn(user))
    }
    return checkStateFn(checkUser, redirectUrlFn)
  }

  const requireUser = requireUserFn()
  const requireAdmin = requireUserFn(user => user.get('admin'))

  /**
   * Redirect to another path
   * @param  {string} path - new path to redirect to
   */
  function redirectFn(path) {
    return (nextState, replace, callback) => {
      replace(path)
      callback()
    }
  }

  const routes = [
    ...adminRoutes(store),
    {
      component: require('./modules/app/containers/App'),
      routes: [{
        path: '/',
        exact: true,
        component: require('./modules/app/containers/Landing'),
      }, {
        path: '/login',
        component: require('./modules/users/containers/Login'),
      }, {
        path: '/register',
        component: require('./modules/users/containers/Register'),
      }],
    },
  ]

  return routes
  // return (
  //   <Switch>
  //     <Route path="/" exact component={require('./modules/app/containers/Landing')} />

  //     <Route path="/login" component={require('./modules/users/containers/Login')} />
  //     <Route path="/register" component={require('./modules/users/containers/Register')} />
  //     <Route path="/reset-request" component={require('./modules/users/containers/ResetRequest')} />
  //     <Route path="/reset" component={require('./modules/users/containers/Reset')} />
  //     <Route path="/confirm-email" component={require('./modules/users/containers/EmailConfirm')} />

  //     <Route path="/:slug" component={require('./modules/app/containers/StaticPage')} />
  //   </Switch>
  // )
}

    // <Route path="/" name="app" component={require('./modules/app/containers/App')}>
    //   <IndexRoute component={require('./modules/app/containers/Landing')} />

    //   <AdminRoute path="/admin" name="admin" onEnter={requireAdmin} />

    //   <Route component={require('./modules/users/containers/Login')} path="login" />
    //   <Route component={require('./modules/users/containers/ResetRequest')} path="reset-request" />
    //   <Route component={require('./modules/users/containers/Reset')} path="reset" />
    //   <Route component={require('./modules/users/containers/EmailConfirm')} path="confirm-email" />

    //   <Route path="register" component={require('./modules/users/containers/Register')} />

    //   <Route path="/:slug" component={require('./modules/app/containers/StaticPage')} />
    // </Route>