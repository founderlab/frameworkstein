/* eslint-env browser */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reset } from 'fl-auth-redux'
import Reset from '../components/Reset'


@connect(state => ({
  auth: state.auth,
}), {reset, push})
export default class ResetContainer extends React.PureComponent {

  static propTypes = {
    auth: PropTypes.object,
    location: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
    // push: PropTypes.func.isRequired,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
  }

  onReset = async data => {
    try {
      await this.props.reset(`${this.context.url}/reset`, data.email && data.email.trim(), data.password, data.resetToken)
      // this.props.push(this.props.location.query.returnTo || '/')
      window.location.href = this.props.location.query.returnTo || '/'
    }
    catch (err) {
      console.log(err)
    }
  }

  render() {
    const { auth } = this.props
    const errorMsg = auth.get('errors') && auth.get('errors').get('reset') && auth.get('errors').get('reset').toString()

    return (
      <React.Fragment>
        <Helmet title="Reset your password" />
        <Reset
          errorMsg={errorMsg}
          email={this.props.location.query.email}
          resetToken={this.props.location.query.resetToken}
          onSubmit={this.onReset}
        />
      </React.Fragment>
    )
  }
}
