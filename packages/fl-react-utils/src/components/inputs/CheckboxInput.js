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
        const input = <Input type="checkbox" {...innerProps} />

        return fat ? (
          <FatLabel
            input={input}
            label={label}
            icon={icon}
            help={help}
            active={innerProps.checked}
          />
        ) : (
          <Label check className="p-2">
            {input} {label}
          </Label>
        )
      }}
    </InputContainer>
  )
}

CheckboxInput.propTypes = {
  name: PropTypes.string.isRequired,
  visibleItemCount: PropTypes.number,
  lessLabel: PropTypes.node,
  moreLabel: PropTypes.node,
  helpTop: PropTypes.bool,
}

CheckboxInput.defaultProps = {
  visibleItemCount: 50,
  lessLabel: 'Less',
  moreLabel: 'More',
  helpTop: false,
}
