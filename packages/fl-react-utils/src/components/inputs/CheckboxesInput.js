import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Label, Input, Button } from 'reactstrap'
import InputContainer from './InputContainer'


export default function CheckboxesInput(props) {
  const [showAll, setShowAll] = React.useState(false)
  const { options, visibleItemCount, colProps } = props
  const showMoreBtn = options.length > visibleItemCount
  const isSelected = (value, valueList) => _.includes(_.map(valueList, v => v.toString()), value)

  return (
    <InputContainer {...props}>
      {innerProps => {
        const currentValues = innerProps.value || []

        const onChangeFn = value => () => {
          const newValues = isSelected(value, currentValues) ? _.without(currentValues, value) : currentValues.concat(value)
          innerProps.onChange(_.compact(_.uniq(newValues)).sort())
        }

        return (
          <>
            <Row>
              {_.map(options, (option, i) => {
                const hidden = !showAll && (i >= visibleItemCount)
                return (
                  <Col {...colProps} key={option.value}>
                    <div className={`form-check ${hidden ? 'd-none' : ''}`}>
                      <Label check className="p-2 w-100">
                        <Input
                          type="checkbox"
                          onChange={onChangeFn(option.value)}
                          checked={isSelected(option.value, currentValues)}
                          name={innerProps.name}
                          valid={innerProps.valid}
                          invalid={innerProps.invalid}
                        /> {option.label}
                      </Label>
                    </div>
                  </Col>
                )
              })}
            </Row>
            {showMoreBtn && <Button className="px-0" color="link" onClick={() => setShowAll(!showAll)}>{showAll ? props.lessLabel : props.moreLabel}</Button>}
          </>
        )
      }}
    </InputContainer>
  )
}

CheckboxesInput.propTypes = {
  options: PropTypes.array.isRequired,
  visibleItemCount: PropTypes.number,
  lessLabel: PropTypes.node,
  moreLabel: PropTypes.node,
}

CheckboxesInput.defaultProps = {
  visibleItemCount: 50,
  options: [],
  lessLabel: 'Less',
  moreLabel: 'More',
  colProps: {
    xs: 12,
    sm: 6,
  },
}
