import _ from 'lodash' // eslint-disable-line
import React from 'react'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'
import {Nav, NavItem} from 'reactstrap'
import {modelAdmins} from '../index'

// Links to all model index pages for the sidebar
export default function Sidebar() {

  const links = _.map(modelAdmins, modelAdmin => (
    <LinkContainer key={modelAdmin.path} to={modelAdmin.link()}><NavItem>{modelAdmin.plural}</NavItem></LinkContainer>
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
