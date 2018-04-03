import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'


export default class S3Image extends Component {

  static propTypes = {
    className: PropTypes.string,
    filename: PropTypes.string.isRequired,
  }

  static contextTypes = {
    s3Url: PropTypes.string.isRequired,
  }

  render() {
    const {className, filename} = this.props
    const url = `${this.context.s3Url}/${filename}`

    return (
      <img src={url} className={className} />
    )
  }
}
