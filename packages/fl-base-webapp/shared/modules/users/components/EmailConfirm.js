import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'


export default class EmailConfirm extends Component {

  static propTypes = {
    errorMsg: PropTypes.string,
    loading: PropTypes.bool,
    emailConfirmed: PropTypes.bool,
  }

  render() {
    const {emailConfirmed, loading, errorMsg} = this.props

    return (
      <div className="form-page email-confirm">
        <header>
          <Container>
            <Row>
              <Col xs={12}>
                <h2 className="text-center">Email confirmed</h2>
              </Col>
            </Row>
          </Container>
        </header>

        <Container>
          <Row>
            <Col xs={12} sm={{size: 10, offset: 1}}>
              <Card>
                <CardBody>
                  {loading && <small>loading...</small>}
                  {errorMsg && <small>{errorMsg}</small>}

                  {emailConfirmed && (
                    <div className="text-center">
                      <p className="text-center">Thanks! Your email is confirmed. Redirecting you to your dashboard...</p>
                      <br />
                      <p><Link to="/" className="text-center">Head now</Link></p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
