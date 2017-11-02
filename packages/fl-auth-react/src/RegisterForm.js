import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import {Input} from 'fl-react-utils'
import {reduxForm, Field} from 'redux-form'
import {validateEmailPass} from './validation'

@reduxForm({
  form: 'register',
  validate: validateEmailPass,
})
export default class RegisterForm extends Component {

  static propTypes = {
    loading: PropTypes.bool,
    errorMsg: PropTypes.string,
    facebook: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
  }

  render() {
    const {loading, errorMsg, facebook, handleSubmit} = this.props

    return (
      <form onSubmit={handleSubmit}>

        <Field
          type="text"
          name="email"
          inputProps={{placeholder: 'Email'}}
          component={Input}
        />
        <Field
          type="password"
          name="password"
          inputProps={{placeholder: 'Password (6 or more characters)'}}
          component={Input}
        />

        <Button onClick={handleSubmit} bsStyle="primary" type="submit">Register</Button>

        {loading && <small>loading...</small>}
        {errorMsg && <small>{errorMsg}</small>}

        {facebook && (<a href="/auth/facebook">Login with Facebook</a>)}
      </form>
    )
  }

}
