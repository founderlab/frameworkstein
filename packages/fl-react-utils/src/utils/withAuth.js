import React from 'react'
import { Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'


export default function withAuth(Component) {

  class AuthComponent extends React.Component {
    static propTypes = {
      auth: PropTypes.object.isRequired,
      route: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
    }

    render() {
      const { route, location } = this.props
      const authenticated = !route.authenticate || route.authenticate(this.props)
      const redirectUrl = route.redirectUrl ? route.redirectUrl(location.pathname) : '/'

      return authenticated ? (
        <Component {...this.props} />
      ) : (
        <Redirect to={{ pathname: redirectUrl, state: { from: location } }} />
      )
    }
  }

  AuthComponent.WrappedComponent = Component
  AuthComponent.displayName = `withAuth(${Component.displayName || Component.name || 'AnonComponent'})`

  return compose(
    withRouter,
    connect(state => ({
      auth: state.auth,
    })),
  )(AuthComponent)
}
