import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { resetRequest } from 'fl-auth-redux'
import ResetRequest from '../components/ResetRequest'


@connect(state => _.extend(_.pick(state, 'auth', 'config'), {}), {resetRequest})
export default class ResetRequestContainer extends Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    resetRequest: PropTypes.func.isRequired,
  }

  onReset = data => {
    this.props.resetRequest(`${this.props.config.get('url')}/reset-request`, data.email && data.email.trim())
  }

  query = () => qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

  render() {
    const {auth} = this.props
    const err = auth.get('errors') && auth.get('errors').get('reset_request')
    const loading = auth.get('loading')
    const resetEmailSent = auth.get('resetEmailSent')

    return (
      <div>
        <Helmet title="Reset your password" />
        <ResetRequest
          errorMsg={err ? err.toString() : ''}
          loading={loading}
          resetEmailSent={resetEmailSent}
          email={this.query().email}
          onSubmit={this.onReset}
        />
      </div>
    )
  }
}
