/* eslint-disable react/no-array-index-key */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Step, Steps, StepHeader } from 'fl-react-steps'
import StepButtons from './StepButtons'


export default class StepsManager extends React.PureComponent {

  static propTypes = {
    steps: PropTypes.array.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    onComplete: PropTypes.func,
    title: PropTypes.string,
    push: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    completeText: PropTypes.string,
    hideHeader: PropTypes.func,
  }

  componentWillReceiveProps(newProps) {
    const totalSteps = this.props.steps.length
    if (newProps.match.params.step > totalSteps) this.props.onComplete()
  }

  currentStep = () => +this.props.match.params.step || 1

  isLastStep = () => this.currentStep() === this.props.steps.length

  goToStep = _step => {
    const step = +_step
    if (step < 1 || step === this.currentStep()) return
    if (step > this.props.steps.length) return this.props.onComplete()
    this.props.push(`${this.props.path}/${step}${this.props.location.search}`)
  }

  back = () => this.goToStep(this.currentStep() - 1)
  next = () => this.goToStep(this.currentStep() + 1)

  renderButtons = ({nextOnClick}={}) => {
    const props = {
      onNext: nextOnClick ? this.next : null,
      onBack: this.currentStep() > 1 ? this.back : null,
      loading: this.props.loading,
    }
    if (this.isLastStep()) props.nextText = this.props.completeText || 'Complete'
    return (<StepButtons {...props} />)
  }

  render() {
    const { steps, title, hideHeader } = this.props
    const headings = steps.map(step => step.heading || '')
    const currentStep = this.currentStep()
    let showHeader = true
    if (hideHeader) {
      showHeader = _.isFunction(hideHeader) ? !hideHeader(this.props, currentStep, this) : false
    }

    return (
      <div className="form-container">

        {title && <h3 className="text-center mt-4">{title}</h3>}

        {showHeader && (
          <StepHeader headings={headings} step={currentStep} onChangeStep={this.goToStep} />
        )}

        <div className="mt-4 steps" id="c" ref={c => this._container = c}>
          <Steps step={currentStep} unmount>
            {steps.map((stepDescriptor, idx) => {
              const Comp = stepDescriptor.component || stepDescriptor
              const props = stepDescriptor.props || {}
              return (
                <Step key={idx}>
                  <Comp
                    enableReinitialize
                    renderButtons={this.renderButtons}
                    onNext={this.next}
                    onBack={this.back}
                    onSubmitFail={() => {
                      this._container.scrollIntoView()
                    }}
                    {...this.props}
                    {...props}
                  />
                </Step>
              )
            })}
          </Steps>
        </div>

      </div>
    )
  }
}
