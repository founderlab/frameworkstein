import { withAuth } from 'fl-react-utils'
import { modelAdmins } from './index'
import Admin from './containers/Admin'
import ModelTypeList from './containers/ModelTypeList'
import createModelDetailEditor from './containers/create/ModelDetailEditor'
import createModelListEditor from './containers/create/ModelListEditor'
import createModelCreate from './containers/create/ModelCreate'
import settings from './settings'

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
console.log('getRoutes, settings.rootPath', settings.rootPath)
  const routes = [{
    path: settings.rootPath,
    exact: true,
    component: withAuth(ModelTypeList),
  }]

  modelAdmins.forEach(modelAdmin => {
    routes.push(modelAdmin.listRoute || {
      path: `${settings.rootPath}/${modelAdmin.path}`,
      exact: true,
      component: withAuth(modelAdmin.ListComponent || createModelListEditor(modelAdmin)),
    })
    routes.push(modelAdmin.createRoute || {
      path: `${settings.rootPath}/${modelAdmin.path}/create`,
      exact: true,
      component: withAuth(modelAdmin.CreateComponent || createModelCreate(modelAdmin)),
    })
    routes.push(modelAdmin.detailRoute || {
      path: `${settings.rootPath}/${modelAdmin.path}/:id`,
      exact: true,
      component: withAuth(modelAdmin.DetailComponent || createModelDetailEditor(modelAdmin)),
    })
  })

  return [
    {
      component: withAuth(Admin),
      path: settings.rootPath,
      authenticate: requireAdmin,
      redirectUrl: loginUrl,
      routes,
    },
  ]
}
