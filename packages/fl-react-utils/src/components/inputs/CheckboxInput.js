import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'


export default function CheckboxInput(props) {
  const { fat, icon, label, help } = props

  return (
    <InputContainer {...props} check label={false} help={fat ? '' : help}>
      {innerProps => {
        const input = <Input type="checkbox" {...innerProps} />

        return fat ? (
          <Label check className="radio-inline d-flex bg-light mb-4">
            {input}
            <div className="ml-2">
              <div><i className={`fad fa-fw fa-${icon} text-primary mr-2`} />{label}</div>
              <div className="small text-muted">{help}</div>
            </div>
          </Label>
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
