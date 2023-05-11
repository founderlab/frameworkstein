import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Button } from 'reactstrap'
import ModelListTable from '../components/ModelListTable'
import SearchBox from './SearchBox'
import Loader from './Loader'


export default function ModelList(props) {
  const { modelAdmin, currentPage, totalItems, visibleItems, loading, handleSaveFn, handleDeleteFn } = props
  const { Pagination } = modelAdmin.components
  const tableProps = { modelAdmin, handleSaveFn, handleDeleteFn, models: visibleItems }

  const startCount = modelAdmin.perPage * (currentPage-1) + 1
  const endCount = startCount + visibleItems.length - 1

  return (
    <section className="fla-model-list">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <p className="fla-back"><Link to={modelAdmin.rootPath} className="fla-back"><i className="fal fa-chevron-left" /> Admin home</Link></p>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>{modelAdmin.plural}</h1>
          </Col>
        </Row>
        <Row className="fla-controls mb-3">
          <Col xs="auto">
            <Button tag={Link} to={modelAdmin.createLink()} color="primary">
              <i className="fal fa-plus" /> Add a new {modelAdmin.name}
            </Button>
          </Col>
          <Col xs="auto" className="fla-search ms-auto d-flex">
            <SearchBox {...props} />
          </Col>
          <Col xs="auto" className="fla-pagination ms-auto d-flex">
            {totalItems && <span className="fla-item-count">{startCount} - {endCount} of {totalItems}</span>}
            <Pagination itemsPerPage={modelAdmin.perPage} {...props} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {loading ? <Loader /> : (
              <ModelListTable {...tableProps} />
            )}
          </Col>
        </Row>
      </Container>
    </section>
  )
}

ModelList.propTypes = {
  visibleItems: PropTypes.array.isRequired,
  modelAdmin: PropTypes.object.isRequired,
  handleSaveFn: PropTypes.func.isRequired,
  handleDeleteFn: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  loading: PropTypes.bool,
}
