import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'
import RegisterForm from './RegisterForm'

export default class Register extends Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }

  render() {

    return (
      <section className="form-page">
        <header>
          <Container>
            <Row>
              <Col xs={12}>
                <h2 className="text-center">Create your profile</h2>
              </Col>
            </Row>
          </Container>
        </header>

        <Container>
          <Row>
            <Col xs={12}>
              <Card>
                <CardBody><RegisterForm {...this.props} /></CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    )
  }
}
