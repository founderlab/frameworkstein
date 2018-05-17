import React from 'react'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Sidebar } from 'fl-react-utils'
import { renderRoutes } from 'react-router-config'
import Navbar from '../components/Navbar'
import AdminSidebar from '../components/Sidebar'
import headerTags from '../utils/headerTags'


@connect(state => ({
  config: state.config,
}))
export default class Admin extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
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
