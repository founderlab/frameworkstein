import React from 'react'
import PropTypes from 'prop-types'
import BooleanInput from './BooleanInput'
import CheckboxesInput from './CheckboxesInput'
import CheckboxInput from './CheckboxInput'
import DateInput from './DateInput'
import DatetimeInput from './DatetimeInput'
import RadioInput from './RadioInput'
import RatingInput from './RatingInput'
import ReactSelectInput from './ReactSelectInput'
import S3UploaderInput from './S3UploaderInput'
import SelectInput from './SelectInput'
import TextInput from './TextInput'
import TimeInput from './TimeInput'


export default function FLInput(props) {
  const inputProps =  {...props}
  if (!inputProps.type && inputProps.input && inputProps.input.type) inputProps.type = inputProps.input.type
  if (!inputProps.input) {
    inputProps.input = {}
    if (inputProps.onChange) inputProps.input.onChange = inputProps.onChange
  }

  switch (inputProps.type) {
    case 'date':
      return <DateInput {...inputProps} />
    case 'datetime':
      return <DatetimeInput {...inputProps} />
    case 'time':
      return <TimeInput {...inputProps} />
    case 'select':
      return <SelectInput {...inputProps} />
    case 'react-select':
      return <ReactSelectInput {...inputProps} />
    case 'checkbox':
      return <CheckboxInput {...inputProps} />
    case 'checkboxes':
      return <CheckboxesInput {...inputProps} />
    case 'radio-list':
      return <RadioInput {...inputProps} />
    case 'boolean':
      return <BooleanInput {...inputProps} />
    case 'rating':
      return <RatingInput {...inputProps} />
    case 'image':
    case 'file':
      return <S3UploaderInput {...inputProps} />
    default:
      return <TextInput {...inputProps} />
  }
}

FLInput.propTypes = {
  input: PropTypes.object,
  type: PropTypes.string,
  onChange: PropTypes.func,
}
