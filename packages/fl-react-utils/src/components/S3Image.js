/* eslint-disable jsx-a11y/alt-text */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'


export default class S3Image extends React.Component {

  static propTypes = {
    filename: PropTypes.string.isRequired,
  }

  static contextTypes = {
    s3Url: PropTypes.string.isRequired,
  }

  render() {
    const { filename, ...rest } = this.props
    const url = `${this.context.s3Url}/${filename}`

    return (
      <img src={url} {...rest} />
    )
  }
}
