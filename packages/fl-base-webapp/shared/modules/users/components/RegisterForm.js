import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Alert, Row, Col } from 'reactstrap'
import { connect } from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'
import { Link } from 'react-router-dom'
import { Input } from 'fl-react-utils'
import { validateEmailPass } from '../validation'
import TermsModal from './TermsModal'
import PrivacyModal from './PrivacyModal'
import Button from '../../utils/components/Button'


const selector = formValueSelector('register')

// Connect this form to redux to get the current value of email. Kind of bleh, but whatever
@connect(
  state => ({email: selector(state, 'email')}),
)
@reduxForm({
  form: 'quick-register',
  validate: validateEmailPass,
})
export default class RegisterForm extends Component {

  static propTypes = {
    loading: PropTypes.bool,
    email: PropTypes.string,
    errorMsg: PropTypes.string,
    query: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    returnTo: PropTypes.string,
    title: PropTypes.string,
  }

  static defaultProps = {
    query: {},
    returnTo: '',
    title: 'Sign up',
  }

  constructor() {
    super()
    this.state = {showTermsModal: false, showPrivacyModal: false}
  }

  openTermsModal = () =>  this.setState({showTermsModal: true})
  openPrivacyModal = () =>  this.setState({showPrivacyModal: true})

  closeTermsModal = () => this.setState({showTermsModal: false})
  closePrivacyModal = () => this.setState({showPrivacyModal: false})

  render() {
    const { loading, errorMsg, handleSubmit, email, query, title, returnTo } = this.props
    const showEmail = !!(this.state.showEmail || loading)
    if (email) query.email = email

    return (
      <div className="register text-center">
        <h2 className="header">{title}</h2>
        <form onSubmit={handleSubmit}>
          <Row>
            <Col sm={{size: 8, offset: 2}} className="text-left">
              <Field
                name="firstName"
                label="First name*"
                inputProps={{placeholder: 'Nicolas'}}
                component={Input}
              />
              <Field
                name="lastName"
                label="Last name*"
                inputProps={{placeholder: 'Cage'}}
                component={Input}
              />
              <Field
                name="email"
                type="email"
                label="Email*"
                inputProps={{placeholder: 'Email'}}
                component={Input}
              />
              <Field
                name="password"
                label="Password*"
                type="password"
                inputProps={{placeholder: 'Password (6 or more characters)'}}
                component={Input}
              />

              {errorMsg && (
                <Alert color="primary">
                  {errorMsg === 'User already exists' ? (
                    <div>
                      <strong>Hey!</strong> Looks like that email is already registered. You can <Link to={{pathname: '/login', query}}> sign in here</Link>.
                    </div>
                  ) : errorMsg}
                  <span style={{display: 'none'}}>{errorMsg}</span>
                </Alert>
              )}

              <Button block loading={loading} color="primary" size="large" type="submit">Join the community</Button>

            </Col>
          </Row>

          <p className="small light">
            By signing up, you agree to our <a href="/terms" target="_blank">terms of use</a> and <a href="/privacy" target="_blank">privacy policy</a>.
          </p>
        </form>

        <TermsModal show={this.state.showTermsModal} toggle={this.closeTermsModal} />
        <PrivacyModal show={this.state.showPrivacyModal} toggle={this.closePrivacyModal} />
      </div>
    )
  }
}
