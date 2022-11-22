import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Select from '../Select'
import InputContainer from './InputContainer'


export default function ReactSelectInput(props) {
  const { inputProps, options } = props

  return (
    <InputContainer {...props}>
      {innerProps => (
        <Select
          {..._.omit(innerProps, 'onBlur')}
          {...inputProps}
          options={options}
        />
      )}
    </InputContainer>
  )
}

ReactSelectInput.propTypes = {
  inputProps: PropTypes.object,
  options: PropTypes.array,
}

ReactSelectInput.defaultProps = {
  inputProps: {},
  options: [],
}
