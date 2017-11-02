import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'
import {Grid, Row, Col, Glyphicon, Button} from 'react-bootstrap'
import ModelListTable from '../components/ModelListTable'

export default function ModelList(props) {
  const {modelAdmin, config, currentPage, itemsPerPage, totalItems, visibleItems, handleSaveFn, handleDeleteFn} = props
  const {Pagination} = modelAdmin.components
  const tableProps = {modelAdmin, config, handleSaveFn, handleDeleteFn, models: visibleItems}

  const startCount = itemsPerPage * (currentPage-1) + 1
  const endCount = startCount + visibleItems.length - 1

  return (
    <section className="fla-model-list">
      <Grid fluid>
        <Row>
          <Col xs={12}>
            <p className="fla-back"><Link to={modelAdmin.rootPath} className="fla-back"><Glyphicon glyph="chevron-left" />Admin home</Link></p>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>{modelAdmin.plural}</h1>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="fla-controls">
            <LinkContainer to={modelAdmin.createLink()}>
              <Button bsStyle="primary">
                <Glyphicon glyph="plus" /> Add a new {modelAdmin.name}
              </Button>
            </LinkContainer>
            <div className="fla-pagination pull-right">
              <Pagination className="pull-right" {...props} />
              {totalItems && <span className="fla-item-count pull-right">{startCount} - {endCount} of {totalItems}</span>}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <ModelListTable {...tableProps} />
          </Col>
        </Row>
      </Grid>
    </section>
  )
}

ModelList.propTypes = {
  visibleItems: PropTypes.array.isRequired,
  modelAdmin: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  handleSaveFn: PropTypes.func.isRequired,
  handleDeleteFn: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
}
