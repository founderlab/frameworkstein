import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Media } from 'reactstrap'
import classNames from 'classnames'
import Avatar from './Avatar'


export default class AvatarName extends React.Component {

  static propTypes = {
    profile: PropTypes.object,
    startup: PropTypes.object,
    source: PropTypes.object,
    isStartup: PropTypes.bool,
    caret: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
  }

  isStartup = () => !!this.props.startup

  source = () => this.props.profile || this.props.startup || this.props.source

  link = () => this.isStartup() ? `/startups/${this.source().id}` : `/people/${this.source().id}`

  name = () => {
    const source = this.source()
    if (source.name) return source.name
    if (source.displayName) return source.displayName
    return ''
  }

  render() {
    const {className, caret} = this.props
    const source = this.source()
    if (!source) return null

    return (
      <Media className={classNames('avatar-name align-items-center', className)}>
        <Media tag="div" left>
          <Avatar linked size="sm" {...this.props} className="mr-2" />
        </Media>

        <Media body className="d-flex align-items-center">
          <Link className="text-dark d-flex flex-1 justify-content-between" to={this.link()}>
            {this.name()}
            {caret && <i className="fa fa-angle-right text-muted" />}
          </Link>
          {this.props.children}
        </Media>
      </Media>
    )
  }
}
