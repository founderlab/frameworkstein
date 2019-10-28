import React from 'react'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { renderRoutes } from 'react-router-config'
import { Sidebar } from 'fl-react-utils'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/Sidebar'
import headerTags from '../utils/headerTags'
import AdminContext from '../AdminContext'


@connect(state => ({
  auth: state.auth,
  config: state.config,
}))
export default class Admin extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
  }

  state = {}

  constructor(props) {
    super(props)
    this.state = {
      url: this.props.config.get('url'),
      s3Url: this.props.config.get('s3Url'),
    }
  }

  render() {
    const { auth, location } = this.props
    if (!auth.get('user') || !auth.get('user').get('admin')) return <Redirect to={`/login?returnTo=${location.pathname}`} />

    const sidebarProps = {
      sidebar: <AdminSidebar />,
      sidebarClassName: 'fla-sidebar',
    }

    return (
      <AdminContext.Provider value={this.state}>
        <Sidebar {...sidebarProps}>
          <Helmet
            title=""
            titleTemplate="%s - admin"
            {...headerTags(this.props)}
          />
          <Navbar />
          <div className="fla-main">
            {renderRoutes(this.props.route.routes)}
          </div>
        </Sidebar>
      </AdminContext.Provider>
    )
  }
}
