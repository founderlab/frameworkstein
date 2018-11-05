import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { register } from 'fl-auth-redux'
import { saveProfile, loadActiveProfile } from '../actions'

import Steps from '../../utils/components/Steps'
import DetailsStep from '../components/registerSteps/DetailsStep'
import RegisterStep from '../components/registerSteps/RegisterStep'
import NotFound from '../../utils/components/NotFound'


@connect(state => ({
  auth: state.auth,
  profiles: state.profiles,
  profile: state.profiles.get('active') && state.profiles.get('active').toJSON(),
}), {register, saveProfile, loadActiveProfile, push})
export default class RegisterContainer extends React.PureComponent {

  static propTypes = {
    location: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    profiles: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    saveProfile: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    loadActiveProfile: PropTypes.func.isRequired,
    loadUserScoreCards: PropTypes.func.isRequired,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
    organisation: PropTypes.object.isRequired,
  }

  state = {}

  componentWillMount() {
    const userExists = !!this.props.auth.get('user')
    const step = +this.props.match.params.step

    // Go to first step if we don't have a user
    if (!userExists && step > 1) {
      return this.props.push(this.props.match.path.replace('/:step', ''))
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.state.firstReg && +newProps.match.params.step > 1) {
      // Remove flag after progressing
      this.setState({firstReg: false})
    }
  }

  currentStep = () => this._steps && this._steps.currentStep() || 1

  path = () => this.props.match.path.replace('/:step', '')

  handleComplete = () => this.props.push(this.props.location.query.returnTo || '/')

  loading = () => {
    const { auth, profiles } = this.props
    return auth.get('loading') || profiles.get('loading') || (this.state.firstReg && this.currentStep() === 1)
  }

  errorMsg = () => {
    const { auth, profiles } = this.props
    const userError = auth.get('errors') && auth.get('errors').get('register')
    if (userError) return userError.toString()
    const profileError = profiles.get('errors') && profiles.get('errors').get('saveProfile')
    if (profileError) return profileError.toString()
    return ''
  }

  handleSubmit = async data => {
    const profile = _.extend(this.props.profile, data)
    try {
      await this.props.saveProfile(profile)
      this._steps.next()
    }
    catch (err) {
      return console.log(err)
    }
  }

  handleRegister = async data => {
    data.organisation_id = this.context.organisation.id
    data.email = data.email && data.email.trim()
    try {
      await this.props.register(`${this.context.url}/register`, data)
      this.setState({firstReg: true})
      const userId = this.props.auth.get('user').get('id')
      await this.props.loadActiveProfile({user_id: userId})
      await this.props.loadUserScoreCards(userId)
      this._steps.next()
    }
    catch (err) {
      return console.log(err)
    }
  }

  render() {
    const { auth, profile } = this.props

    const user = auth.get('user') && auth.get('user').toJSON()
    const email = user && user.email
    const initialValues = _.extend({}, profile, {email})

    const steps = [
      {
        component: RegisterStep,
        props: {
          onSubmit: this.handleRegister,
        },
      },
      DetailsStep,
    ]

    const title = `Register`
    const description = `Register ...`

    return (
      <div>
        <Helmet>
          <title itemProp="name" lang="en">{title}</title>
          <meta name="description"        content={description} />
          <meta property="og:title"       content={title} />
          <meta property="og:description" content={description} />
        </Helmet>
        <Steps
          ref={c => this._steps = c}
          // unmount
          completeText="Save my profile"
          errorMsg={this.errorMsg()}
          hideHeader={(props, step) => step === 1}
          initialValues={initialValues}
          loading={this.loading()}
          onComplete={this.handleComplete}
          onSubmit={this.handleSubmit}
          path={this.path()}
          profile={profile}
          steps={steps}
          user={user}
          {...this.props}
        />
      </div>
    )
  }
}
