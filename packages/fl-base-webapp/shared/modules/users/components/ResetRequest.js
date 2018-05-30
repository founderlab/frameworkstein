import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'
import { ResetRequestForm } from 'fl-auth-react'

export default class ResetRequest extends Component {

  static propTypes = {
    loading: PropTypes.bool,
    email: PropTypes.string,
    errorMsg: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
  }

  render() {
    const { loading, email, errorMsg } = this.props
    const notFound = errorMsg === 'User not found'
    const err = errorMsg && !notFound

    return (
      <div className="form-page reset-request">

        <header>
          <Container>
            <Row>
              <Col xs={12}>
                <h2 className="text-center">Reset your password</h2>
              </Col>
            </Row>
          </Container>
        </header>

        <Container>
          <Row>
            <Col xs={12} sm={{size: 10, offset: 1}}>
              <Card>
                <CardBody>
                  <ResetRequestForm initialValues={{email}} {...this.props} />
                  {errorMsg === 'User not found' && (<p>Sorry, we don't have that email registered. You can <Link to="/register">sign up here</Link></p>)}
                  {err && (<p>Sorry, something went wrong while resetting your password. Please <a href="mailto:reseterror@frameworkstein.com">get in touch with us</a> so we can fix it up.</p>)}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
