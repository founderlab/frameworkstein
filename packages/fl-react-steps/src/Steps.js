import _ from 'lodash' //eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'


export default class Steps extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    step: PropTypes.number.isRequired,        // Current step
  }

  state = {
    transitioningFromStep: null,
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.step !== null && nextProps.step !== this.props.step) {
      if (this.state.transitioningFromStep) return
      const transitioningFromStep = this.props.step
      this.setState({transitioningFromStep})
    }
  }

  handlePaneAnimateOutEnd = (/*step*/) => {
    this.setState({transitioningFromStep: null})
  }

  renderStep = (child, i) => {
    const childStep = i + 1 // start from 1
    const transitioningFromStep = this.state.transitioningFromStep
    const isAlreadyActive = transitioningFromStep && childStep === transitioningFromStep

    return React.cloneElement(
      child,
      {
        key: child.key ? child.key : childStep,
        step: childStep,
        active: !transitioningFromStep && childStep === this.props.step,
        onAnimateOutEnd: isAlreadyActive ? this.handlePaneAnimateOutEnd : null,
        ..._.omit(this.props, 'children', 'step'),
      },
    )
  }

  render() {
    const { children } = this.props
    const childrenArray = React.Children.toArray(children)

    return (
      <div>
        {_.map(_.compact(childrenArray), this.renderStep)}
      </div>
    )
  }
}
