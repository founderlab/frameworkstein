import _ from 'lodash' //eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


export default class StepHeader extends Component {

  static propTypes = {
    step: PropTypes.number,
    onChangeStep: PropTypes.func.isRequired,
    steps: PropTypes.array,
    headings: PropTypes.array,
    className: PropTypes.string,
    stepClass: PropTypes.string,
    stepClassName: PropTypes.string,
  }

  static defaultProps = {
    step: 1,
    className: 'clearfix',
    stepClass: '',
    stepClassName: '',
  }

  constructor() {
    super()
    this.state = {maxStep: 1}
  }

  componentWillReceiveProps(newProps) {
    if (newProps.step > this.state.maxStep) this.setState({maxStep: newProps.step})
  }

  stepEnabled = step => step <= Math.max(this.state.maxStep, this.props.step)
  handleStepFn = step => () => this.stepEnabled(step) && this.props.onChangeStep(step)

  render() {
    const { step, steps, headings } = this.props
    const stepClass = this.props.stepClassName || this.props.stepClass
    const titles = headings || _.map(steps, step => step.heading || '')

    return (
      <div className={classNames(this.props.className, 'step-header')}>
        {titles.map((title, i) => {
          const index = i + 1

          const classes = {
            step: true,
            active: index === step,
            complete: index < step,
            disabled: !this.stepEnabled(index),
          }

          return (
            <div role="button" tabIndex={0} key={index} className={classNames(classes, stepClass)} onClick={this.handleStepFn(index)}>

              {title && (
                <div className="text">
                  <div className="text-inner">
                    {title}
                  </div>
                </div>
              )}
              <div className="dot">
                <div className="number">{index}</div>
              </div>
              {index > 1 && (<div className="bar bar-left" />)}
              {index < titles.length && (<div className="bar bar-right" />)}
            </div>
          )
        })}
      </div>
    )
  }
}
