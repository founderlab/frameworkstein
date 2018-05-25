import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import { login } from 'fl-auth-redux'
import qs from 'qs'
import querystring from 'querystring'
import Login from '../components/Login'


const selector = formValueSelector('login')
@connect(state => _.extend(_.pick(state, 'auth'), { email: selector(state, 'email') }), { login })
export default class LoginContainer extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired,
    email: PropTypes.string,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
  }

  state = {}

  query = () => qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

  handleSubmit = data => {
    this.props.login(`${this.context.url}/login`, data.email && data.email.trim(), data.password, err => {
      if (!err) {
        this.setState({ loaded: true }, () => window.location.href = this.query().returnTo || '/')
      }
    })
  }

  render() {
    const {auth, email} = this.props
    // Stay loading while the redirect is happening
    const loading = auth.get('loading') || this.state.loaded
    const errorMsg = auth.get('errors') ? auth.get('errors').get('login') : null
    const initialValues = {}
    const query = this.query()
    if (query.email) initialValues.email = query.email

    const title = `Sign in`
    const description = `Sign in`

    return (
      <div>
        <Helmet>
          <title itemProp="name" lang="en">{title}</title>
          <meta name="description"        content={description} />
          <meta property="og:title"       content={title} />
          <meta property="og:description" content={description} />
        </Helmet>
        <Login initialValues={initialValues} loading={loading} errorMsg={errorMsg} onSubmit={this.handleSubmit} email={email} query={query} returnTo={query.returnTo} />
      </div>
    )
  }
}
