import { withAuth } from 'fl-react-utils'
import {modelAdmins} from './index'
import Admin from './containers/Admin'
import ModelTypeList from './containers/ModelTypeList'
import createModelEditor from './containers/create/ModelEditor'
import createModelCreate from './containers/create/ModelCreate'


const loginUrl = path => `/login?returnTo=${path}`
const registerUrl = path => `/register?returnTo=${path}`

/**
 * Returns true if the user exists, and passes an optional checkFn
 * @param  {function} checkFn - optional function to check the user
 * @return {bool} - whether the state has passed the user check
 */
function requireUserFn(checkFn) {
  return (props) => {
    const { auth } = props
    const user = auth.get('user')
    return user && (!checkFn || checkFn(user))
  }
}

const requireUser = requireUserFn()
const requireAdmin = requireUserFn(user => user.get('admin'))


export default function getRoutes() {

  const routes = [{
    path: '/admin',
    exact: true,
    component: withAuth(ModelTypeList),
  }]

  modelAdmins.forEach(modelAdmin => {
    routes.push(modelAdmin.listRoute || {
      path: `/admin/${modelAdmin.path}`,
      exact: true,
      component: withAuth(modelAdmin.ListComponent || createModelEditor(modelAdmin)),
    })
    routes.push(modelAdmin.createRoute || {
      path: `/admin/${modelAdmin.path}/create`,
      exact: true,
      component: withAuth(modelAdmin.CreateComponent || createModelCreate(modelAdmin)),
    })
    routes.push(modelAdmin.detailRoute || {
      path: `/admin/${modelAdmin.path}/:id`,
      exact: true,
      component: withAuth(modelAdmin.DetailComponent || createModelEditor(modelAdmin)),
    })
  })

  return [
    {
      component: withAuth(Admin),
      path: '/admin',
      authenticate: requireAdmin,
      redirectUrl: loginUrl,
      routes,
    },
  ]
}
