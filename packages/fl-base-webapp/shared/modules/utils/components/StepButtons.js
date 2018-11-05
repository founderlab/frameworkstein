import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'reactstrap'
import Button from './Button'


export default class StepButtons extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    nextDisabled: PropTypes.bool,
    onBack: PropTypes.func,
    onNext: PropTypes.func,
    nextText: PropTypes.node,
    color: PropTypes.string,
    size: PropTypes.string,
  }

  static defaultProps ={
    nextText: 'Continue',
    color: 'primary',
    size: 'lg',
  }

  render() {
    const { loading, nextDisabled, onBack, onNext, nextText, color, size } = this.props
    const buttonProps = {loading, color, size}
    if (onNext) buttonProps.onClick = onNext
    if (nextDisabled) buttonProps.disabled = true

    return (
      <Row className="mt-4 align-items-center justify-content-between">
        <Col xs="auto">
          {onBack && <Button outline color={color} disabled={loading} size={size} onClick={onBack}>Back</Button>}
        </Col>
        <Col xs="auto">
          <Button type="submit" {...buttonProps}>{nextText}</Button>
        </Col>
      </Row>
    )
  }
}
