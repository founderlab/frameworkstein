import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { resetRequest } from 'fl-auth-redux'
import ResetRequest from '../components/ResetRequest'


@connect(state => ({
  auth: state.auth,
}), {resetRequest})
export default class ResetRequestContainer extends React.PureComponent {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    resetRequest: PropTypes.func.isRequired,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
  }

  onReset = async data => {
    try {
      await this.props.resetRequest(`${this.context.url}/reset-request`, data.email && data.email.trim())
    }
    catch (err) {
      console.log(err)
    }
  }

  render() {
    const { auth, location } = this.props
    const err = auth.get('errors') && auth.get('errors').get('resetRequest')
    const loading = auth.get('loading')
    const resetEmailSent = auth.get('resetEmailSent')

    return (
      <React.Fragment>
        <Helmet title="Reset your password" />
        <ResetRequest
          errorMsg={err ? err.toString() : ''}
          loading={loading}
          resetEmailSent={resetEmailSent}
          email={location.query.email}
          onSubmit={this.onReset}
        />
      </React.Fragment>
    )
  }
}
