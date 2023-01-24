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
  switch (props.type) {
    case 'date':
      return <DateInput {...props} />
    case 'datetime':
      return <DatetimeInput {...props} />
    case 'time':
      return <TimeInput {...props} />
    case 'select':
      return <SelectInput {...props} />
    case 'react-select':
      return <ReactSelectInput {...props} />
    case 'checkbox':
      return <CheckboxInput {...props} />
    case 'checkboxes':
      return <CheckboxesInput {...props} />
    case 'radio-list':
      return <RadioInput {...props} />
    case 'boolean':
      return <BooleanInput {...props} />
    case 'rating':
      return <RatingInput {...props} />
    case 'image':
    case 'file':
      return <S3UploaderInput {...props} />
    default:
      return <TextInput {...props} />
  }
}

FLInput.propTypes = {
  type: PropTypes.string,
}
