import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Gravatar from 'react-gravatar'
import { S3Image } from 'fl-react-utils'
// import Icon from '../../utils/components/Icon'


const sizes = {
  sm: 28,
  md: 56,
  lg: 112,
}

export default class Avatar extends React.Component {

  static propTypes = {
    size: PropTypes.string,
    linked: PropTypes.bool,
    className: PropTypes.string,
    startup: PropTypes.object,
    profile: PropTypes.object,
    source: PropTypes.object,
    bordered: PropTypes.bool,
    // defaultIcon: PropTypes.string,
  }

  static defaultProps = {
    size: 'md',
    // defaultIcon: 'flaticon/motorcyclist',
  }

  state = {}

  isStartup = () => !!this.props.startup

  source = () => this.props.profile || this.props.startup || this.props.source

  link = () => this.isStartup() ? `/startups/${this.source().id}` : `/people/${this.source().id}`

  initials = source => {
    let res = ''
    if (source.name) return source.name[0]
    if (source.firstName) res += source.firstName[0] || ''
    if (source.lastName) res += source.lastName[0] || ''
    return res
  }

  handleMissingImage = e => {
    e.target.style.display = 'none'
    this.setState({imageError: true})
  }

  render() {
    const { className, size } = this.props
    const source = this.source()
    if (!source) return null

    let image = null
    // Could use initial circles as the default icon here
    const initials = null //this.initials(source)
    // const initials = this.initials(source)

    // <Icon style={{width: size, height: size}} icon={this.props.defaultIcon} />
    let fallback = (
      <div className="avatar-backup">
        {initials ? (
          <div className="avatar-initials">{initials}</div>
        ) : (
          <img alt="avatar" className="avatar-image default" src={this.isStartup() ? '/public/images/frameworkstein-bowl-dark.png' : '/public/images/frameworkstein-bowl.png'} />
        )}
      </div>
    )

    if (this.state.imageError) {
      console.log('Image error:', source.avatarUrl)
    }
    else if (source.avatarImage || source.logoImage) {
      image = (<S3Image alt="avatar" className="avatar-image" filename={source.avatarImage || source.logoImage} />)
      fallback = null
    }
    else if (source.avatarUrl) {
      image = (<img alt="avatar" className="avatar-image" src={source.avatarUrl} onError={this.handleMissingImage} />)
      fallback = null
    }
    else if (source.emailMd5) {
      image = (
        <div>
          <Gravatar alt={null} md5={source.emailMd5} size={sizes[this.props.size]} default="blank" />
        </div>
      )
    }

    const classes = classNames(className, `avatar avatar-${size}`, {
      profile: !this.isStartup(),
      startup: this.isStartup(),
      bordered: this.props.bordered,
    })

    return (
      <div className={classes}>
        {this.props.linked ? (
          <Link to={this.link()}>
            {image}
            {fallback}
          </Link>
        ) : (
          <div>
            {image}
            {fallback}
          </div>
        )}
      </div>
    )
  }
}
