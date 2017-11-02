import _ from 'lodash' //eslint-disable-line
import React, {Component, PropTypes} from 'react'

export default class Steps extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    step: PropTypes.number.isRequired,
  }

  constructor() {
    super()
    this.state = {prevStep: null}
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.step !== null && nextProps.step !== this.props.step) {
      // check if the 'prevStep' child still exists
      const prevStep = this.props.step

      React.Children.forEach(nextProps.children, (child) => {
        if (React.isValidElement(child)) {
          if (child.props.step === prevStep) {
            this.setState({prevStep})
            return
          }
        }
      })
    }
  }

  handlePaneAnimateOutEnd() {
    this.setState({prevStep: null})
  }

  renderStep = (child, i) => {
    const index = i + 1 // start from 1
    const prevStep = this.state.prevStep
    const isAlreadyActive = prevStep && child.props.step === prevStep

    return React.cloneElement(
      child,
      {
        key: child.key ? child.key : index,
        step: index,
        active: !prevStep && index === this.props.step,
        onAnimateOutEnd: isAlreadyActive ? this.handlePaneAnimateOutEnd : null,
      }
    )
  }

  render() {
    const {children} = this.props
    const childrenArray = React.Children.toArray(children)
    return (
      <div>
        {_.map(_.compact(childrenArray), this.renderStep)}
      </div>
    )
  }
}
