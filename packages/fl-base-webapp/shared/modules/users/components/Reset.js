import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'
import { ResetForm } from 'fl-auth-react'


export default class Reset extends Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className="form-page password-reset">

        <header>
          <Container>
            <Row>
              <Col xs={12}>
                <h2 className="text-center">Enter a new password</h2>
              </Col>
            </Row>
          </Container>
        </header>

        <Container>
          <Row>
            <Col xs={12} sm={{size: 10, offset: 1}}>
              <Card>
                <CardBody>
                  <ResetForm {...this.props} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
