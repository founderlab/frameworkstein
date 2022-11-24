import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'


export default function RadioInput(props) {
  const { name, options, fat, inline } = props

  function renderItemsInline(innerProps) {
    return (
      <div>
        {options.map(opt => (
          <Label key={opt.value} className="radio-inline mr-3">
            <Input
              {...innerProps}
              name={name}
              type="radio"
              value={opt.value}
              checked={opt.value === innerProps.value}
              className="pos-relative ml-0"
            />
            {opt.label}
          </Label>
        ))}
      </div>
    )
  }

  function renderItemColumns(innerProps) {
    return (
      <Row>
        {options.map(opt => (
          <Col xs={6} key={opt.value}>
            <Label className="radio-inline form-check">
              <Input
                {...innerProps}
                name={name}
                type="radio"
                value={opt.value}
                checked={opt.value === innerProps.value}
                className="pos-relative ml-0"
              />
              {opt.label}
            </Label>
          </Col>
        ))}
      </Row>
    )
  }

  function renderItemsFat(innerProps) {
    return (
      <div>
        {options.map(opt => (
          <div key={opt.value} className="form-check last-0">
            <Label className="radio-inline d-flex bg-light">
              <Input
                {...innerProps}
                name={name}
                type="radio"
                value={opt.value}
                checked={opt.value === innerProps.value}
                className="pos-relative ml-0"
              />
              <div className="ml-2">
                <div><i className={`fad fa-fw fa-${opt.icon} text-primary mr-2`} />{opt.label}</div>
                <div className="small text-muted">{opt.help}</div>
              </div>
            </Label>
          </div>
        ))}
      </div>
    )
  }

  return (
    <InputContainer {...props}>
      {innerProps => {
        if (fat) return renderItemsFat(innerProps)
        else if (inline) return renderItemsInline(innerProps)
        return renderItemColumns(innerProps)
      }}
    </InputContainer>
  )
}

RadioInput.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
}

RadioInput.defaultProps = {
  options: [],
}
