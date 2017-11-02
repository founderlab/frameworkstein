import _ from 'lodash' // eslint-disable-line
import React from 'react'
import {Link} from 'react-router'
import {Grid, Row, Col} from 'react-bootstrap'
import {modelAdmins} from '../index'

// Landing page for the auto admin. Just links to all model index pages.
export default function ModelTypeList() {

  const links = _.map(modelAdmins, modelAdmin => (
    <Row key={modelAdmin.path}>
      <Col lg={8} lgOffset={1}>
        <Link className="fla-model-type-list-link" to={modelAdmin.link()}>{modelAdmin.plural}</Link>
      </Col>
    </Row>
  ))

  return (
    <section className="fla-model-type-list">
      <Grid fluid>
        <Row>
          <Col lg={8} lgOffset={1}>
            <h1>Admin Home</h1>
          </Col>
        </Row>
        {links}
      </Grid>
    </section>
  )

}
