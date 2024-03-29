import _ from 'lodash' // eslint-disable-line
import React from 'react'
import { Link } from 'react-router-dom'
import { Nav, NavItem, NavLink } from 'reactstrap'
import { modelAdmins } from '../index'
import settings from '../settings'


// Links to all model index pages for the sidebar
export default function Sidebar() {
  const links = _.map(modelAdmins, modelAdmin => (
    <NavItem key={modelAdmin.path}><NavLink tag={Link} to={modelAdmin.link()}>{modelAdmin.plural}</NavLink></NavItem>
  ))

  return (
    <div>
      <Link to={settings.rootPath} className="fla-sidebar-header">
        <i className="fal fa-rocket" />
      </Link>
      <Nav pills vertical>
        {links}
      </Nav>
    </div>
  )
}
