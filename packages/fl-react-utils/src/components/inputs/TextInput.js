import React from 'react'
import PropTypes from 'prop-types'
import { InputGroup, InputGroupText, Input } from 'reactstrap'
import InputContainer from './InputContainer'


export default function TextInput(props) {
  const { type, prepend, append, inputProps } = props

  return (
    <InputContainer {...props}>
      {innerProps => {
        const { validating, ...rest } = innerProps

        return (
          <InputGroup>
            {prepend && (
              <InputGroupText>{prepend}</InputGroupText>
            )}
            <Input type={type} {...rest} {...inputProps} />
            {append && (
              <InputGroupText>{append}</InputGroupText>
            )}
            {innerProps.validating ? <i className="fa fa-loader fa-spin pos-absolute" style={{ right: -24, top: 13 }} /> : null}
          </InputGroup>
        )
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
