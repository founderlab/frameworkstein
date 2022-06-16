import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Input } from 'fl-react-utils'
import { FormGroup, Label, FormControl } from 'reactstrap'


export default function BelongsTo(_props) {
  const { relationField, modelStore, ...props } = _props
  const { modelAdmin } = relationField
  const models = modelStore.get('models').toJSON ? modelStore.get('models').toJSON() : {}

  const options = _.map(models, model => ({label: modelAdmin.display(model), value: model.id}))

  if (relationField.readOnly || relationField.linked) {
    const relatedModel = _.find(models, model => model.id === props.input.value)
    if (!relatedModel) return null
    const value = modelAdmin.display(relatedModel)

    return (
      <FormGroup>
        <Label>{props.label}</Label>
        {relationField.linked ? (
          <Link to={modelAdmin.link(relatedModel)} className="list-group-item" key={relatedModel.id} target="_blank">
            {value}
          </Link>
        ) : (
          <FormControl.Static>{value}</FormControl.Static>
        )}
      </FormGroup>
    )
  }

  return (
    <Input
      type="react-select"
      options={options}
      {...props}
    />
  )
}

BelongsTo.propTypes = {
  relationField: PropTypes.object.isRequired,
  modelStore: PropTypes.object.isRequired,
  input: PropTypes.object.isRequired,
  label: PropTypes.node,
}
