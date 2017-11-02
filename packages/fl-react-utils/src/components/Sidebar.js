import _ from 'lodash' // eslint-disable-line
import React, {Component, PropTypes} from 'react'
import {Glyphicon} from 'react-bootstrap'
import Sidebar from 'react-sidebar'

export default class FLSidebar extends Component {

  static propTypes = {
    changeKey: PropTypes.string,
    dockedWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    disableToggle: PropTypes.bool,
    sidebar: PropTypes.element.isRequired,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    sidebarClassName: 'sidebar',
    dockedWidth: 768,
  }

  constructor() {
    super()
    this.state = {docked: false, open: false}
  }

  componentWillMount() {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(min-width: ${this.props.dockedWidth}px)`)
    mql.addListener(this.handleMediaQueryChanged)
    this.setState({mql, docked: mql.matches})
  }

  componentWillReceiveProps(newProps) {
    if (newProps.changeKey !== this.props.changeKey) this.setState({open: false})
  }

  componentWillUnmount() {
    this.state.mql && this.state.mql.removeListener(this.handleMediaQueryChanged)
  }

  onSetOpen = open => {
    this.setState({open})
  }

  handleMediaQueryChanged = () => {
    this.setState({docked: this.state.mql && this.state.mql.matches})
  }

  handleSidebarToggle = ev => {
    this.setState({open: !this.state.open})
    if (ev) ev.preventDefault()
  }

  render() {
    const sidebarProps = _.extend({}, this.props, {
      docked: this.state.docked,
      open: this.state.open,
      onSetOpen: this.onSetOpen,
    })

    const disableSidebarToggle = this.props.disableToggle || this.state.docked

    return (
      <Sidebar {...sidebarProps}>
        {!disableSidebarToggle && (
          <div className="sidebar-toggle">
            <a onClick={this.handleSidebarToggle}>
              <Glyphicon glyph="menu-hamburger" />
            </a>
          </div>
        )}
        {this.props.children}
      </Sidebar>
    )
  }

}
