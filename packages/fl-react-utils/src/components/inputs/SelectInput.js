import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import InputContainer from './InputContainer'
import { FormGroup, Label, Input, FormText, FormFeedback, Row, Col, InputGroup, InputGroupAddon } from 'reactstrap'


export default function SelectInput(props) {
  const { includeEmpty, inputProps, options } = props
  const placeholder = inputProps.placeholder || props.placeholder

  return (
    <InputContainer {...props}>
      {innerProps => (
        <Input type="select" {...inputProps} {...innerProps}>
          {includeEmpty && <option />}
          {placeholder && <option value="">{placeholder}</option>}
          {_.map(options, opt => {
            const option = _.isObject(opt) ? opt : {label: opt, value: opt}
            return (
              <option key={option.value} value={option.value}>{option.label}</option>
            )
          })}
        </Input>
      )}
    </InputContainer>
  )
}

SelectInput.propTypes = {
  options: PropTypes.array,
  inputProps: PropTypes.object,
  placeholder: PropTypes.string,
  includeEmpty: PropTypes.bool,
}

SelectInput.defaultProps = {
  inputProps: {},
  options: [],
  placeholder: 'Select...',
}
