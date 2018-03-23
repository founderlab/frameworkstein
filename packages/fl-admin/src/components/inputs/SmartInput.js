import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Input} from 'fl-react-utils'
import JsonInput from './JsonInput'


export default function SmartInput(_props) {
  const {modelField, ...props} = _props

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

  return (<Input {...props} />)
}

SmartInput.propTypes = {
  modelField: PropTypes.object.isRequired,
  type: PropTypes.string,
}
