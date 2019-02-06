import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Card, CardBody } from 'reactstrap'
import { ResetRequestForm } from 'fl-auth-react'


export default class ResetRequest extends React.PureComponent {

  static propTypes = {
    email: PropTypes.string,
    errorMsg: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
  }

  render() {
    const { email, errorMsg } = this.props
    const notFound = errorMsg === 'User not found'
    const err = errorMsg && !notFound

    return (
      <section className="form-container">
        <h4>Reset your password</h4>
        <Card>
          <CardBody>
            <ResetRequestForm initialValues={{email}} {...this.props} />
            {errorMsg === 'User not found' && <p>Sorry, we don't have that email registered. You can <Link to="/register">sign up here</Link>. If you might have signed up with LinkedIn you can try <Link to="/login">signing in</Link> again.</p>}
            {err && <p>Sorry, something went wrong while resetting your password. Please get in touch with us so we can fix it up.</p>}
          </CardBody>
        </Card>
      </section>
    )
  }
}
