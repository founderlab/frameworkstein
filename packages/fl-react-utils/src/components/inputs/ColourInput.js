import React from 'react'
import PropTypes from 'prop-types'
import { InputGroup, InputGroupText, Input } from 'reactstrap'
import InputContainer from './InputContainer'


export default function ColourInput(props) {
  const { inputProps, showColourInput } = props

  return (
    <InputContainer {...props}>
      {innerProps => {
        const input = <Input type="text" {...innerProps} {...inputProps} />
console.log('innerProps', innerProps)
        return (
          <InputGroup>
            {showColourInput ? (
              <input
                {...innerProps}
                type="color"
                className="input-group-text"
                style={{
                  height: 40,
                  width: 40,
                  padding: 6,
                }}
              />
            ) : (
              <InputGroupText
                style={{
                  backgroundColor: innerProps.value,
                  borderColor: innerProps.value,
                  width: 40,
                  display: 'inline-block',
                }}
              />
            )}
            {input}
          </InputGroup>
        )
      }}
    </InputContainer>
  )
}

ColourInput.propTypes = {
  inputProps: PropTypes.object,
}

ColourInput.defaultProps = {
  inputProps: {},
  showColourInput: true,
}
