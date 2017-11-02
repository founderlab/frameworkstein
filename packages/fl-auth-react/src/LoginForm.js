import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import {reduxForm, Field} from 'redux-form'
import {Input} from 'fl-react-utils'
import {validateEmailPass} from './validation'

@reduxForm({
  form: 'register',
  validate: validateEmailPass,
})
export default class LoginForm extends Component {

  static propTypes = {
    loading: PropTypes.bool,
    errorMsg: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    mode: PropTypes.string,
  }

  render() {
    const {loading, errorMsg, facebook, handleSubmit} = this.props
    const formClass = (this.props.mode === 'horizontal' ? 'form-inline': '')

    return (
      <form className={formClass} onSubmit={handleSubmit}>

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

        <Button onClick={handleSubmit} bsStyle="primary" type="submit">Login</Button>

        {loading && <small>loading...</small>}
        {errorMsg && <small>{errorMsg}</small>}

      </form>
    )
  }

}
