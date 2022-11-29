import React from 'react'
import PropTypes from 'prop-types'
import RadioInput from './RadioInput'


export default function BooleanInput(props) {
  const { trueLabel, falseLabel, trueHelp, falseHelp, input, ...rest } = props

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
          help: trueHelp,
        },
        {
          label: falseLabel,
          value: 'false',
          help: falseHelp,
        },
      ]}
    />
  )
}

BooleanInput.propTypes = {
  trueLabel: PropTypes.node,
  falseLabel: PropTypes.node,
  trueHelp: PropTypes.node,
  falseHelp: PropTypes.node,
  input: PropTypes.object.isRequired,
}

BooleanInput.defaultProps = {
  trueLabel: 'Yes',
  falseLabel: 'No',
}
