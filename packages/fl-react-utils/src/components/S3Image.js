/* eslint-disable jsx-a11y/alt-text */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'


export default class S3Image extends React.Component {

  static propTypes = {
    s3Url: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
  }

  render() {
    const { filename, s3Url, ...rest } = this.props
    const url = `${s3Url}/${filename}`

    return (
      <img src={url} {...rest} />
    )
  }
}
