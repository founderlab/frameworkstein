import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'reactstrap'
import ModelListForm from './forms/ModelListForm'
import { shouldEditFieldInline, shouldDisplayFieldInline } from '../utils/inline'


export default function ModelListTable(props) {
  const { models, modelAdmin, handleSaveFn, handleDeleteFn } = props

  const modelListRows = _.map(models, model => {
    return (
      <ModelListForm
        form={`modelListRow_${model.id}`}
        initialValues={model}
        key={model.id}
        formKey={model.id}
        model={model}
        modelAdmin={modelAdmin}
        onSubmit={handleSaveFn(model)}
        onDelete={handleDeleteFn(model)}
      />
    )
  })

  let showSave = false
  const headings = [<th key="fl-name" className="fla-name-th">Model</th>]

  _.forEach(modelAdmin.fields, (field, key) => {
    if (shouldEditFieldInline(field)) showSave = true
    if (shouldEditFieldInline(field) || shouldDisplayFieldInline(field)) {
      headings.push(<th key={key} className="fla-list-edit-th">{field.label || key}</th>)
    }
  })

  if (showSave) headings.push(<th key="fl-save" className="fla-save-th">Save</th>)
  if (modelAdmin.listDelete) headings.push(<th key="fl-delete" className="fla-delete-th">Delete</th>)

  return (
    <Table>
      <thead>
        <tr>
          {headings}
        </tr>
      </thead>
      <tbody>
        {modelListRows}
      </tbody>
    </Table>
  )
}

ModelListTable.propTypes = {
  models: PropTypes.array.isRequired,
  modelAdmin: PropTypes.object.isRequired,
  handleSaveFn: PropTypes.func.isRequired,
  handleDeleteFn: PropTypes.func.isRequired,
}
