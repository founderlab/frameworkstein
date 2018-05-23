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

  static childContextTypes = {
    url: PropTypes.string,
  }

  getChildContext() {
    return {
      url: this.state.url,
    }
  }

  componentWillMount() {
    if (!this.state.url) {
      this.setState({
        url: this.props.config.get('url'),
      })
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
    )
  }
}
