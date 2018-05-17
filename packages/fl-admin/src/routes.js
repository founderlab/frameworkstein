import {modelAdmins} from './index'
import Admin from './containers/Admin'
import ModelTypeList from './containers/ModelTypeList'
import createModelEditor from './containers/create/ModelEditor'
import createModelCreate from './containers/create/ModelCreate'


export default function getRoutes() {

  const routes = [{
    path: '/admin',
    exact: true,
    component: ModelTypeList,
  }]

  modelAdmins.forEach(modelAdmin => {
    console.log('modelAdmin.path', modelAdmin.path)
    routes.push(modelAdmin.listRoute || {
      path: `/admin/${modelAdmin.path}`,
      exact: true,
      component: modelAdmin.ListComponent || createModelEditor(modelAdmin),
    })
    routes.push(modelAdmin.createRoute || {
      path: `/admin/${modelAdmin.path}/create`,
      exact: true,
      component: modelAdmin.CreateComponent || createModelCreate(modelAdmin),
    })
    routes.push(modelAdmin.detailRoute || {
      path: `/admin/${modelAdmin.path}/:id`,
      exact: true,
      component: modelAdmin.DetailComponent || createModelEditor(modelAdmin),
    })
  })

  return [
    {
      component: Admin,
      path: '/admin',
      routes,
    },
  ]
}
