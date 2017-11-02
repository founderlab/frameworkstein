import _ from 'lodash'
import {PropTypes} from 'react'
import {Route} from 'react-router'
import {createRoutesFromReactChildren} from 'react-router/lib/RouteUtils'

import {modelAdmins} from './index'
import Admin from './containers/Admin'
import ModelTypeList from './containers/ModelTypeList'
import createModelEditor from './containers/create/ModelEditor'
import createModelCreate from './containers/create/ModelCreate'

export default class AdminRoute extends Route {

  static propTypes = {
    path: PropTypes.string,
    getComponent: PropTypes.func,
    getComponents: PropTypes.func,
  }

  constructor(options) {
    super()
    _.extend(this, options)
    if (!this.component) this.component = Admin
    this.indexRoute = {component: ModelTypeList}
  }

  getChildRoutes(location, callback) {
    if (!this.childRoutes) {
      this.childRoutes = []

      modelAdmins.forEach(modelAdmin => {
        this.childRoutes.push(modelAdmin.listRoute || {
          path: modelAdmin.path,
          component: modelAdmin.ListComponent || createModelEditor(modelAdmin),
        })
        this.childRoutes.push(modelAdmin.createRoute || {
          path: `${modelAdmin.path}/create`,
          component: modelAdmin.CreateComponent || createModelCreate(modelAdmin),
        })
        this.childRoutes.push(modelAdmin.detailRoute || {
          path: `${modelAdmin.path}/:id`,
          component: modelAdmin.DetailComponent || createModelEditor(modelAdmin),
        })
      })
    }

    callback(null, this.childRoutes)
  }

  // This method is used by react-router to go from a jsx entry to a route object
  // So we use it to check props and instantiate our base route
  static createRouteFromReactElement(element/*, parent*/) {
    const props = _.extend({}, element.type.defaultProps, element.props)

    if (props.children) {
      const childRoutes = createRoutesFromReactChildren(props.children, props)
      if (childRoutes.length) props.childRoutes = childRoutes
      delete props.children
    }
    return new AdminRoute(props)
  }
}
