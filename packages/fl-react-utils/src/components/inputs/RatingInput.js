import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'


export default function RatingInput(props) {
  const { name, minValue, maxValue, lowLabel, midLabel, highLabel, buttonProps } = props

  const values = []
  for (let i=minValue; i <= maxValue; i++) values.push(i)


  function renderItemsInline(innerProps) {
    return (
      <div className="d-flex align-items-center justify-content-between">
        {values.map(v => (
          <Button
            key={v}
            onClick={() => innerProps.onChange(v)}
            outline={v !== innerProps.value}
            {...buttonProps}
          >
            {v}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <InputContainer {...props}>
      {innerProps => {
        return renderItemsInline(innerProps)
      }}
    </InputContainer>
  )
}

RatingInput.propTypes = {
  name: PropTypes.string.isRequired,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  lowLabel: PropTypes.node,
  midLabel: PropTypes.node,
  highLabel: PropTypes.node,
  buttonClassName: PropTypes.string,
}

RatingInput.defaultProps = {
  minValue: 1,
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
