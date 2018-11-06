
export const loginUrl = ({branch}) => `/login?returnTo=${branch.match.url}`
export const registerUrl = ({branch}) => `/register?returnTo=${branch.match.url}`
export const simpleRegisterUrl = ({branch}) => `/quick-register?returnTo=${branch.match.url}`
export const programRegisterUrl = ({branch}) => `/program/${branch.match.params.slug}/register?returnTo=${branch.match.url}`

/**
 * Continues if the state passes the checkFn, redirects to login otherwise
 * @param  {function} checkFn - function to check the state
 * @return {bool} - whether the state has passed the check
 */
export function checkStateFn(checkFn, redirectUrlFn=loginUrl) {
  return (nextState, branch) => {
    if (!checkFn(nextState)) {
      return {redirectUrl: redirectUrlFn({state: nextState, branch})}
    }
    return {}
  }
}

/**
 * Returns true if the user exists, and passes an optional checkFn
 * @param  {function} checkFn - optional function to check the user
 * @return {bool} - whether the state has passed the user check
 */
export function requireUserFn(checkFn, redirectUrlFn=loginUrl) {
  const checkUser = state => {
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
export function redirectFn(path) {
  return () => ({redirectUrl: path})
}

const requireUser = requireUserFn()
export {requireUser}

const requireAdmin = requireUserFn(user => user.get('admin'))
export {requireAdmin}
