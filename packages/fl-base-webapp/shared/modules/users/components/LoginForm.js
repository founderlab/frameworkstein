import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Alert, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { reduxForm, Field } from 'redux-form'
import { Input, allFieldsRequiredFn } from 'fl-react-utils'
import Button from '../../utils/components/Button'

@reduxForm({
  form: 'login',
  validate: allFieldsRequiredFn(['email', 'password']),
})
export default class LoginForm extends Component {

  static propTypes = {
    email: PropTypes.string,
    loading: PropTypes.bool,
    errorMsg: PropTypes.string,
    query: PropTypes.object,
    returnTo: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
  }

  static defaultProps = {
    email: '',
    returnTo: '/',
    query: {},
  }

  errorMsg = () => {
    const {errorMsg, query} = this.props
    if (!errorMsg) return null

    const tryAgain = (<span>Try again or <Link to={{pathname: '/reset-request', query}}>reset your password</Link>.</span>)
    let err = null
    if (errorMsg === 'User not found') err = (<span>Looks like that email address hasn't been registered. You can <Link to={{pathname: '/register', query}}>Register here</Link>.</span>)
    else if (errorMsg === 'Incorrect password') err = (<span>Looks like your password isn't correct. {tryAgain}</span>)
    else err = (<span>Looks like something went wrong. {tryAgain}</span>)

    return (
      <Alert color="warning">
        <strong>Sorry!</strong> {err}
        <span style={{display: 'none'}}>{errorMsg}</span>
      </Alert>
    )
  }

  render() {
    const {handleSubmit, loading, query, returnTo, email} = this.props
    if (email) query.email = email

    return (
      <form onSubmit={handleSubmit} className="login">
        <Row>
          <Col sm={{size: 8, offset: 2}}>
            <Field
              type="email"
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

            {this.errorMsg()}
            <Button loading={loading} type="submit" color="primary" block onClick={handleSubmit}>Sign in</Button>

          </Col>
        </Row>

        <div className="text-center">
          <hr />
          <p>Don't have an account? <Link to={{pathname: '/register', query}}>Register here</Link></p>
          <p>Forgot your password?<Link to={{pathname: '/reset-request', query}}> Reset it here</Link></p>
        </div>
      </form>
    )
  }
}
