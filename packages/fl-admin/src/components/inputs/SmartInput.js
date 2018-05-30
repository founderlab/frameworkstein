import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'fl-react-utils'
import JsonInput from './JsonInput'


export default function SmartInput(_props) {
  const { modelField, ...props } = _props

  // Type of text input specified
  const inputType = modelField.input || modelField.type || props.type
  if (inputType) props.type = inputType.toLowerCase()

  // JsonInput handles json arrays
  if (props.type && props.type.toLowerCase() === 'json') return <JsonInput {..._props} />

  // Options for select
  if (modelField.options) {
    props.type = 'react-select'
    props.options = modelField.options
  }

  if (props.type && _.includes(['boolean', 'checkbox'], props.type.toLowerCase())) props.className = 'mb-3'
  return (<Input {...props} />)
}

SmartInput.propTypes = {
  modelField: PropTypes.object.isRequired,
  type: PropTypes.string,
}
