import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import { reduxForm, Field } from 'redux-form'
import { Input } from 'fl-react-utils'
import { Link } from 'react-router-dom'
import { validateEmailPass } from './validation'

//
// ResetForm
// This page should be reached from a link in a password reset email
// That link should have email / resetToken as query params, which will be in props.query
//

const validatePassword = password => {
  if (!password || (password.length < 6 || password.length > 128)) return 'Passwords should be 6-128 characters'
  return ''
}

@reduxForm({
  form: 'reset',
  validate: validateEmailPass,
})
export default class ResetForm extends Component {

  static propTypes = {
    errorMsg: PropTypes.string,
    email: PropTypes.string.isRequired,
    resetToken: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  }

  onSubmit = data => {
    data.email = this.props.email
    data.resetToken = this.props.resetToken
    this.props.onSubmit(data)
  }

  render() {
    const { loading, errorMsg, email, handleSubmit } = this.props

    if (errorMsg) {
      return (
        <React.Fragment>
          <p>
            Sorry 😦 it looks like this reset token has been used or expired.
            We know it's a pain but we have to do this for security reasons.
          </p>
          <p>
            <Link to={`/reset-request?email=${email}`}>Request a new one here</Link>
          </p>
        </React.Fragment>
      )
    }

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <p>{this.props.email}</p>

        <Field
          type="password"
          name="password"
          inputProps={{placeholder: 'Password (6 or more characters)'}}
          component={Input}
          validate={validatePassword}
        />

        {loading && <p><small>loading...</small></p>}
        {errorMsg && <p><small>errorMsg...</small></p>}

        <Button onClick={handleSubmit(this.onSubmit)} bsStyle="primary" type="submit">Set password</Button>

      </form>
    )
  }
}
