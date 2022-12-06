import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'
import FatLabel from '../FatLabel'


export default function CheckboxInput(props) {
  const { fat, icon, label, help } = props

  return (
    <InputContainer {...props} check label={false} help={fat ? '' : help}>
      {innerProps => {
        const inputComponent = <Input type="checkbox" {...innerProps} />

        return fat ? (
          <FatLabel
            inputComponent={inputComponent}
            label={label}
            icon={icon}
            help={help}
            active={innerProps.checked}
          />
        ) : (
          <Label check className="p-2">
            {inputComponent} {label}
          </Label>
        )
      }}
    </InputContainer>
  )
}

CheckboxInput.propTypes = {
  helpTop: PropTypes.bool,
  help: PropTypes.node,
  fat: PropTypes.bool,
  icon: PropTypes.string,
  label: PropTypes.node,
}

CheckboxInput.defaultProps = {
  helpTop: false,
}
