import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Input} from 'fl-react-utils'

export default function ManyToMany(_props) {
  const {relationField, modelStore, ...props} = _props
  const models = modelStore.get('models').toJSON ? modelStore.get('models').toJSON() : {}

  // const selectOptions = _.map(models, model => (<option key={model.id} value={model.id}>{relationField.modelAdmin.display(model)}</option>))
  const options = _.map(models, model => ({label: relationField.modelAdmin.display(model), value: model.id}))

  return (
    <Input
      type="react-select"
      options={options}
      inputProps={{multi: true}}
      {...props}
    />
  )
}

ManyToMany.propTypes = {
  relationField: PropTypes.object.isRequired,
  modelStore: PropTypes.object.isRequired,
}
