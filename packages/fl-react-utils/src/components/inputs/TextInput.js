import React from 'react'
import PropTypes from 'prop-types'
import { InputGroup, InputGroupText, Input } from 'reactstrap'
import InputContainer from './InputContainer'


export default function TextInput(props) {
  const { type, prepend, append, inputProps } = props

  return (
    <InputContainer {...props}>
      {innerProps => {
        const input = <Input type={type} {...innerProps} {...inputProps} />

        if (prepend || append) {
          return (
            <InputGroup>
              {prepend && (
                <InputGroupText>{prepend}</InputGroupText>
              )}
              {input}
              {append && (
                <InputGroupText>{append}</InputGroupText>
              )}
            </InputGroup>
          )
        }
        return input
      }}
    </InputContainer>
  )
}

TextInput.propTypes = {
  type: PropTypes.string,
  prepend: PropTypes.node,
  append: PropTypes.node,
  inputProps: PropTypes.object,
}

TextInput.defaultProps = {
  type: 'text',
  inputProps: {},
}
