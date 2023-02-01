import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'


export default function RatingInput(props) {
  const { minValue, maxValue, lowLabel, midLabel, highLabel, buttonProps, disabled } = props

  const values = []
  for (let i=minValue; i <= maxValue; i++) values.push(i)

  return (
    <InputContainer {...props}>
      {innerProps => (
        <>
          <div className="d-flex align-items-center justify-content-between pt-1">
            {values.map(v => (
              <Button
                key={v}
                onClick={() => !disabled && innerProps.onChange(v)}
                outline={v !== innerProps.value}
                disabled={disabled}
                {...buttonProps}
              >
                {v}
              </Button>
            ))}
          </div>
          <div className="mt-2 small text-muted pos-relative text-center">
            <div style={{position: 'absolute', left: 0}}>{lowLabel}</div>
            <div style={{position: 'absolute', right: 0}}>{highLabel}</div>
            {midLabel}
          </div>
        </>
      )}
    </InputContainer>
  )
}

RatingInput.propTypes = {
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  lowLabel: PropTypes.node,
  midLabel: PropTypes.node,
  highLabel: PropTypes.node,
  buttonClassName: PropTypes.string,
}

RatingInput.defaultProps = {
  minValue: 0,
  maxValue: 10,
  lowLabel: '',
  midLabel: '',
  highLabel: '',
  buttonProps: {
    color: 'dark',
    style: {
      width: 38,
    },
    className: 'rounded px-0',
  },
}
