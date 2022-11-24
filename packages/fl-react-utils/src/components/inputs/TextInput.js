import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { InputGroup, InputGroupAddon, Input } from 'reactstrap'
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
                <InputGroupAddon addonType="prepend">
                  <InputGroupAddon addonType="prepend">{prepend}</InputGroupAddon>
                </InputGroupAddon>
              )}
              {input}
              {append && (
                <InputGroupAddon addonType="append">
                  <InputGroupAddon addonType="append">{append}</InputGroupAddon>
                </InputGroupAddon>
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
}

TextInput.defaultProps = {
  type: 'text',
  inputProps: {},
}
