import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import {reduxForm, Field} from 'redux-form'
import {Input} from 'fl-react-utils'
import {validateEmailPass} from './validation'

//
// ResetForm
// This page should be reached from a link in a password reset email
// That link should have email / resetToken as query params, which will be in props.query
//

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
  }

  onSubmit = data => {
    data.email = this.props.email
    data.resetToken = this.props.resetToken
    this.props.onSubmit(data)
  }

  render() {
    const {loading, errorMsg, handleSubmit} = this.props

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <p>{this.props.email}</p>

        <Field
          type="password"
          name="password"
          inputProps={{placeholder: 'Password (6 or more characters)'}}
          component={Input}
        />

        {loading && <small>loading...</small>}
        {errorMsg && <small>{errorMsg}</small>}

        <Button onClick={handleSubmit(this.onSubmit)} bsStyle="primary" type="submit">Set password</Button>

      </form>
    )
  }
}
