import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'
import { FormGroup, Label } from 'reactstrap'
import ModelListTable from '../ModelListTable'


export default function InlineRelation(props) {
  const {config, relationField, models, label, onAdd, handleSaveFn, handleDeleteFn} = props
  const {modelAdmin} = relationField
  const tableProps = {models, modelAdmin, config, handleSaveFn, handleDeleteFn}

  return (
    <FormGroup>
      {label ? (<Label>{label}</Label>) : null}
      <Button color="primary" className="pull-right" onClick={onAdd}><i className="fa fa-plus" /></Button>
      <ModelListTable {...tableProps} />
    </FormGroup>
  )
}

InlineRelation.propTypes = {
  label: PropTypes.string.isRequired,
  relationField: PropTypes.object.isRequired,

  models: PropTypes.array.isRequired,
  config: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  handleSaveFn: PropTypes.func.isRequired,
  handleDeleteFn: PropTypes.func.isRequired,
}
