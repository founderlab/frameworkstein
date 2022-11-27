import React from 'react'
import PropTypes from 'prop-types'
import RadioInput from './RadioInput'


export default function BooleanInput(props) {
  const { trueLabel, falseLabel, input, ...rest } = props

  return (
    <RadioInput
      {...rest}
      input={{
        name: input.name,
        // convert to bool for onChange
        onChange: e => input.onChange(e.target.value === 'true'),
        // convert from bool when receving value
        value: typeof input.value === 'boolean' ? (input.value ? 'true' : 'false') : undefined,
      }}
      options={[
        {
          label: trueLabel,
          value: 'true',
        },
        {
          label: falseLabel,
          value: 'false',
        },
      ]}
    />
  )
}

BooleanInput.propTypes = {
  trueLabel: PropTypes.string,
  falseLabel: PropTypes.string,
  input: PropTypes.object.isRequired,
}

BooleanInput.defaultProps = {
  trueLabel: 'Yes',
  falseLabel: 'No',
}
