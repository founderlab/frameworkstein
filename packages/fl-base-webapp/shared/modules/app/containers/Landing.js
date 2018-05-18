import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Landing from '../components/Landing'


@connect(state => _.extend(_.pick(state, 'auth', 'profiles')))
export default class LandingContainer extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    profiles: PropTypes.object.isRequired,
  }

  render() {
    // const {auth, profiles} = this.props

    return (
      <Landing />
    )
  }
}
