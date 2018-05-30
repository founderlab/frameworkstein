import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import Avatar from '../../utils/components/Avatar'


export default class AppNavbar extends Component {

  static propTypes = {
    profile: PropTypes.object,
  }

  state = {
    isOpen: false,
  }

  toggleNavbar = () => this.setState({isOpen: !this.state.isOpen})

  render() {
    const { profile } = this.props

    if (profile) {
      return (
        <Navbar color="primary" dark expand="md" className="app-nav">
          <NavbarBrand tag={Link} to="/">Frameworkstein</NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink tag={Link} to="/">Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/admin">Admin</NavLink>
              </NavItem>
            </Nav>
            <Nav className="ml-auto mr-3">
              <UncontrolledDropdown nav inNavbar className="profile-dropdown">
                <DropdownToggle nav>
                  <Avatar size="md" profile={profile} />
                  <i className="fa fa-angle-down caret" />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    <Link to="/profile">Profile</Link>
                  </DropdownItem>
                  <DropdownItem>
                    <a href="/logout">Log out</a>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      )
    }

    return (
      <Navbar color="primary" dark className="app-nav">
        <NavbarBrand tag={Link} to="/">Frameworkstein</NavbarBrand>
        <Nav className="ml-auto mr-3">
          <NavLink tag={Link} to="/login">Login</NavLink>
        </Nav>
      </Navbar>
    )
  }
}
