import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'
import LoginForm from './LoginForm'

export default function Login(props) {
  return (
    <Container>
      <Row>
        <Col xs={12} sm={{size: 10, offset: 1}}>
          <h2 className="text-center mb-5">Sign in</h2>

          <Card>
            <CardBody><LoginForm {...props} /></CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
