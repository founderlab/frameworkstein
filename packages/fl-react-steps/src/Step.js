import _ from 'lodash' //eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import TransitionEvents from './TransitionEvents'

export default class Step extends Component {

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    active: PropTypes.bool,
    onAnimateOutEnd: PropTypes.func,
  }

  constructor() {
    super()
    this.state = {
      animateIn: false,
      animateOut: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.animateIn && nextProps.active && !this.props.active) {
      this.setState({animateIn: true})
    }
    else if (!this.state.animateOut && !nextProps.active && this.props.active) {
      this.setState({animateOut: true})
    }
  }

  componentDidUpdate() {
    if (this.state.animateIn) {
      setTimeout(this.startAnimateIn, 0)
    }
    if (this.state.animateOut) {
      TransitionEvents.addEndEventListener(ReactDOM.findDOMNode(this), this.stopAnimateOut)
    }
  }

  componentWillUnmount() {
    TransitionEvents.removeEndEventListener(ReactDOM.findDOMNode(this), this.stopAnimateOut)
  }

  startAnimateIn = () => {
    this.setState({animateIn: false})
  }

  stopAnimateOut = () => {
    this.setState({animateOut: false})
    if (this.props.onAnimateOutEnd) this.props.onAnimateOutEnd()
  }

  render() {
    const classes = {
      fade: true,
      active: this.props.active || this.state.animateOut,
      show: this.props.active && !this.state.animateIn,
      'd-none': !this.props.active && !this.state.animateOut,

      // deprecated
      in: this.props.active && !this.state.animateIn,
      hidden: !this.props.active && !this.state.animateOut,
    }

    return (
      <div
        role="tabpanel"
        aria-hidden={!this.props.active}
        className={classNames(this.props.className, classes)}
      >
        {this.props.children}
      </div>
    )
  }
}
