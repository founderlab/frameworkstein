import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'fl-react-utils'
import { FormGroup, Label, FormControl } from 'reactstrap'


export default function BelongsTo(_props) {
  const { relationField, modelStore, ...props } = _props
  const models = modelStore.get('models').toJSON ? modelStore.get('models').toJSON() : {}

  const options = _.map(models, model => ({label: relationField.modelAdmin.display(model), value: model.id}))

  if (relationField.readOnly) {
    const model = _.find(models, model => model.id === props.input.value)
    const value = relationField.modelAdmin.display(model)
    return (
      <FormGroup>
        <Label>{props.label}</Label>
        <FormControl.Static>{value}</FormControl.Static>
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
  label: PropTypes.string,
}
