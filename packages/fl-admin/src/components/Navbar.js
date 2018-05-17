import _ from 'lodash' // eslint-disable-line
import React from 'react'
import { Navbar } from 'reactstrap'


export default function AdminNavbar() {

  return (
    <Navbar>
      <ul className="nav navbar-nav text-right">
        <li><a href="/logout">Logout</a></li>
      </ul>
    </Navbar>
  )
}
