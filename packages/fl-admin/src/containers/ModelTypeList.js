import _ from 'lodash' // eslint-disable-line
import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import { modelAdmins } from '../index'


// Landing page for the auto admin. Just links to all model index pages.
export default function ModelTypeList() {

  const links = _.map(modelAdmins, modelAdmin => (
    <Row key={modelAdmin.path}>
      <Col xs={12}>
        <Link className="fla-model-type-list-link" to={modelAdmin.link()}>{modelAdmin.plural}</Link>
      </Col>
    </Row>
  ))

  return (
    <section className="fla-model-type-list">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <h1>Admin Home</h1>
          </Col>
        </Row>
        {links}
      </Container>
    </section>
  )
}
