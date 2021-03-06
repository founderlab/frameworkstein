import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import { connect } from 'react-redux'
import { reduxForm, Field, formValueSelector } from 'redux-form'
import { Input } from 'fl-react-utils'


const required = v => v ? '' : 'Required'

// Connect this form to redux to get the current value of email
const selector = formValueSelector('reset')
@connect(state => ({email: selector(state, 'email')}))
@reduxForm({
  form: 'reset',
})
export default class ResetRequestForm extends Component {

  static propTypes = {
    email: PropTypes.string,
    errorMsg: PropTypes.string,
    loading: PropTypes.bool,
    resetEmailSent: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
  }

  render() {
    const { email, errorMsg, handleSubmit, loading, resetEmailSent } = this.props

    return (
      <form onSubmit={handleSubmit}>

        <Field
          type="email"
          name="email"
          inputProps={{placeholder: 'Email'}}
          component={Input}
          validate={required}
        />
        <p><Button onClick={handleSubmit} bsStyle="primary" type="submit">Reset your password</Button></p>

        {loading && <p><small>loading...</small></p>}
        {errorMsg && <p><small>{errorMsg}</small></p>}
        {resetEmailSent && <p>A link to reset your password has been sent to {email}.</p>}

      </form>
    )
  }
}
