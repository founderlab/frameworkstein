import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { reset } from 'fl-auth-redux'
import Reset from '../components/Reset'


@connect(state => _.extend(_.pick(state, 'auth', 'config'), {}), {reset})
export default class ResetContainer extends Component {

  static propTypes = {
    auth: PropTypes.object,
    config: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    reset: PropTypes.func.isRequired,
  }

  onReset = data => {
    this.props.reset(`${this.props.config.get('url')}/reset`, data.email && data.email.trim(), data.password, data.resetToken, err => {
      if (!err) this.props.history.push(this.query().returnTo || '/')
    })
  }

  query = () => qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

  render() {
    const query = this.query()

    return (
      <div>
        <Helmet title="Reset your password" />
        <Reset auth={this.props.auth} email={query.email} resetToken={query.resetToken} onSubmit={this.onReset} />
      </div>
    )
  }
}
