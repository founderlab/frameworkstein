import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import qs from 'qs'
import Helmet from 'react-helmet'
// import { push } from 'redux-router'
import { register } from 'fl-auth-redux'
import { saveProfile, loadActiveProfile } from '../actions'
import Register from '../components/Register'


@connect(state => ({
  auth: state.auth,
  profiles: state.profiles,
}), {register, loadActiveProfile, saveProfile})
export default class RegisterContainer extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    profiles: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    loadActiveProfile: PropTypes.func.isRequired,
    saveProfile: PropTypes.func.isRequired,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
  }

  handleSubmit = data => {
    const { email, password, ...profileData } = data
    const userData = {password, email: email && email.trim()}

    this.props.register(`${this.context.url}/register`, userData, err => {
      if (err) return console.log(err)

      this.props.loadActiveProfile({user_id: this.props.auth.get('user').get('id')}, err => {
        if (err) return console.log(err)

        const profile = _.extend(this.props.profiles.get('active').toJSON(), profileData)

        this.props.saveProfile(profile, err => {
          if (err) return console.log(err) // todo: errors
          this.props.history.push(this.query().returnTo || '/')
        })
      })
    })
  }

  loading = () => this.props.auth.get('loading')

  errorMsg = () => {
    const { auth } = this.props
    const userError = auth.get('errors') && auth.get('errors').get('register')
    if (userError) return userError.toString()
    return ''
  }

  query = () => qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

  render() {
    const { auth } = this.props
    const email = auth.get('user') && auth.get('user').get('email')

    return (
      <div>
        <Helmet title="Profile setup" />
        <Register
          loading={this.loading()}
          errorMsg={this.errorMsg()}

          email={email}
          query={this.query()}

          onSubmit={this.handleSubmit}
        />
      </div>
    )
  }
}
