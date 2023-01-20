import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import classNames from 'classnames'
import InputContainer from './InputContainer'
import FatLabel from '../FatLabel'


export default function RadioInput(props) {
  const { name, options, fat, inline, colProps, disabled } = props

  function renderInput({innerProps, opt}) {
    return (
      <Input
        {...innerProps}
        name={name}
        type="radio"
        value={opt.value}
        checked={opt.value === innerProps.value}
        className="pos-relative ml-0"
        disabled={disabled}
      />
    )
  }

  function renderItemsInline(innerProps) {
    return (
      <div>
        {options.map(opt => (
          <Label key={opt.value} className={classNames('radio-inline mr-3', {disabled})}>
            {renderInput({innerProps, opt})}
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
          <Col {...colProps} key={opt.value}>
            <Label className={classNames('radio-inline form-check', {disabled})}>
              {renderInput({innerProps, opt})}
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
            <FatLabel
              inputComponent={renderInput({innerProps, opt})}
              {...opt}
              active={opt.value === innerProps.value}
            />
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
  name: PropTypes.string,
  options: PropTypes.array,
  colProps: PropTypes.object,
}

RadioInput.defaultProps = {
  options: [],
  colProps: {
    xs: 6,
  },
}
