import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class Icon extends Component {

  static propTypes = {
    root: PropTypes.string,
    icon: PropTypes.string.isRequired,
    extension: PropTypes.string,
    iconPath: PropTypes.func,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  }

  static contextTypes = {
    s3Url: PropTypes.string,
  }

  static defaultProps = {
    extension: '.svg',
    iconPath: (root, icon, extension) => `${root}/icons/${icon}${extension}`,
  }

  render() {
    const { icon, iconPath, extension, ...rest } = this.props
    const root = this.props.root || this.context.s3Url || '/public'
    const iconUrl = iconPath(root, icon, extension)

    return (
      <img alt={icon} {...rest} className={classNames(this.props.className, 'fl-icon')} src={iconUrl} />
    )
  }
}
