/* eslint-disable react/no-array-index-key */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { Alert, Card, CardBody, Row, Col } from 'reactstrap'
import { connect } from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'
import { Link } from 'react-router-dom'
import { Input } from 'fl-react-utils'
import { validateNameEmailPass } from '../../validation'
import Button from '../../../utils/components/Button'
import Checkbox from '../../../utils/components/Checkbox'


const selector = formValueSelector('register')

@reduxForm({
  form: 'register',
  validate: validateNameEmailPass,
  // destroyOnUnmount: false,
})
@connect(
  state => ({email: selector(state, 'email')}),
)
export default class RegisterStep extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    email: PropTypes.string,
    errorMsg: PropTypes.string,
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
  }

  state = {}

  onSubmit = (data) => {
    this.setState({errorMsg: ''})
    if (!this.state.termsAccepted) return this.setState({errorMsg: 'Please accept our Terms of Use to continue'})
    this.props.onSubmit(data)
  }

  render() {
    const { loading, handleSubmit, user, email, location, onNext } = this.props
    const query = location.query
    if (email) query.email = email
    const errorMsg = this.props.errorMsg || this.state.errorMsg

    if (user && !loading) {
      return (
        <div className="text-center mt-4">
          <h4>{email} <i className="fa fa-check" /></h4>
          <Button size="lg" className="mt-4" onClick={onNext}>Continue</Button>
        </div>
      )
    }

    return (
      <div>
        <form onSubmit={handleSubmit(this.onSubmit)}>

          <Card>
            <CardBody className="p-5">

              <div className="text-center mb-4">
                <h2>Sign up</h2>
                <p>
                  <Link to={`/login?${qs.stringify(query)}`}>Already have a Frameworkstein account? Login here</Link>.
                </p>
              </div>

              <h4 className="header text-center pt-4 mb-4">Let's get you started</h4>

              <Row>
                <Col sm={6}>
                  <Field
                    name="firstName"
                    label="First name *"
                    component={Input}
                  />
                </Col>

                <Col sm={6}>
                  <Field
                    name="lastName"
                    label="Last name *"
                    component={Input}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <Field
                    name="email"
                    label="Email *"
                    type="email"
                    component={Input}
                  />
                  <Field
                    type="password"
                    label="Password *"
                    name="password"
                    inputProps={{placeholder: '(6 or more characters)'}}
                    component={Input}
                  />

                  <div className="small light my-3 text-center">
                    <Checkbox checked={!!this.state.termsAccepted} onChange={() => this.setState({termsAccepted: !this.state.termsAccepted})}>
                      I accept Frameworkstein's <a href="/terms" target="_blank">Terms of Use</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
                    </Checkbox>
                  </div>

                  {errorMsg && (
                    <Alert color="secondary">
                      {errorMsg === 'User already exists' ? (
                        <div>
                          <strong>Hey!</strong> Looks like that email is already registered. You can <Link to={`/login?${qs.stringify(query)}`}> login here</Link>.
                        </div>
                      ) : errorMsg}
                      <span style={{display: 'none'}}>{errorMsg}</span>
                    </Alert>
                  )}

                  <div className="text-center">
                    <Button loading={loading} color="primary" size="lg" type="submit">Create my profile</Button>
                  </div>

                </Col>
              </Row>

            </CardBody>
          </Card>
        </form>
      </div>
    )
  }
}
