import React from 'react'
import Helmet from 'react-helmet'
import {Sidebar} from 'fl-react-utils'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/Sidebar'
import headerTags from '../utils/headerTags'

export default class Admin extends React.Component {

  static propTypes = {
    children: React.PropTypes.node,
  }

  render() {
    const sidebarProps = {
      sidebar: <AdminSidebar />,
      sidebarClassName: 'fla-sidebar',
    }

    return (
      <Sidebar {...sidebarProps}>
        <Helmet
          title=""
          titleTemplate={`%s - admin`}
          {...headerTags(this.props)}
        />
        <Navbar />
        <div className="fla-main">
          {this.props.children}
        </div>
      </Sidebar>
    )
  }
}
