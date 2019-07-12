import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'fl-react-utils'


const display = model => model ? (model.name || model.nickname || model.email || model.title || model.id) : 'null'

export default function BelongsToInput(props) {
  const { models } = props
  const options = _.map(models, model => ({label: display(model), value: model.id}))

  return (
    <Input type="react-select" options={options} {...props} />
  )
}

BelongsToInput.propTypes = {
  models: PropTypes.array.isRequired,
}
