import { getRoutes as adminRoutes } from 'fl-admin'


const loginUrl = nextState => `/login?returnTo=${nextState.location.pathname}`
const registerUrl = nextState => `/register?returnTo=${nextState.location.pathname}`

/**
 * Continues if the state passes the checkFn, redirects to login otherwise
 * @param  {function} checkFn - function to check the state
 * @return {bool} - whether the state has passed the check
 */
function checkStateFn(checkFn, redirectUrlFn=loginUrl) {
  return nextState => {
    if (!checkFn(nextState)) {
      return {redirectUrl: redirectUrlFn(nextState)}
    }
    return {}
  }
}

/**
 * Returns true if the user exists, and passes an optional checkFn
 * @param  {function} checkFn - optional function to check the user
 * @return {bool} - whether the state has passed the user check
 */
function requireUserFn(checkFn, redirectUrlFn=loginUrl) {
  const checkUser = (state) => {
    const { auth } = state
    const user = auth.get('user')
    return user && (!checkFn || checkFn(user))
  }
  return checkStateFn(checkUser, redirectUrlFn)
}

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

const requireUser = requireUserFn()
const requireAdmin = requireUserFn(user => user.get('admin'))

export default function getRoutes(store) {

  const routes = [
    ...adminRoutes(store),
    {
      component: require('./modules/app/containers/App'),
      path: '/',
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
      }, {
        path: '/reset-request',
        component: require('./modules/users/containers/ResetRequest'),
      }, {
        path: '/reset',
        component: require('./modules/users/containers/Reset'),
      }, {
        path: '/confirm-email',
        component: require('./modules/users/containers/EmailConfirm'),
      }],
    },
  ]

  return routes
}
