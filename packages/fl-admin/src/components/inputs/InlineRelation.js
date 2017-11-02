import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Glyphicon, Button} from 'react-bootstrap'
import ModelListTable from '../ModelListTable'

export default function InlineRelation(props) {
  const {config, relationField, models, label, onAdd, handleSaveFn, handleDeleteFn} = props
  const {modelAdmin} = relationField
  const tableProps = {models, modelAdmin, config, handleSaveFn, handleDeleteFn}

  return (
    <div>
      {label ? (<label className="control-label">{label}</label>) : null}
      <Button bsStyle="primary" className="pull-right" onClick={onAdd}><Glyphicon glyph="plus" /></Button>
      <ModelListTable {...tableProps} />
    </div>
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
