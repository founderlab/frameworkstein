import _ from 'lodash' // eslint-disable-line
import React from 'react'
import {Link} from 'react-router'
import {Nav, NavItem, NavLink} from 'reactstrap'
import {modelAdmins} from '../index'


// Links to all model index pages for the sidebar
export default function Sidebar() {

  const links = _.map(modelAdmins, modelAdmin => (
    <NavItem key={modelAdmin.path}><NavLink tag={Link} to={modelAdmin.link()}>{modelAdmin.plural}</NavLink></NavItem>
  ))

  return (
    <div>
      <Link to="/admin" className="fla-sidebar-header">
        <i className="fa fa-hand-peace" />
      </Link>
      <Nav bsStyle="pills" stacked>
        {links}
      </Nav>
    </div>
  )
}
