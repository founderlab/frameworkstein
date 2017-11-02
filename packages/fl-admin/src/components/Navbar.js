import _ from 'lodash' // eslint-disable-line
import React from 'react'
import {Navbar, Nav, NavItem} from 'react-bootstrap'

export default function AdminNavbar() {

  return (
    <Navbar fluid>
      <ul className="nav navbar-nav">
        <li className="pull-right"><a href="/logout">Logout</a></li>
      </ul>
    </Navbar>
  )
}
