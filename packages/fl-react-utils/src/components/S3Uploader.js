import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import DropzoneS3Uploader from 'react-dropzone-s3-uploader'
import { Progress } from 'reactstrap'


export default class S3Uploader extends React.Component {

  static propTypes = {
    label: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    maxFileUploadSize: PropTypes.number,
    accept: PropTypes.string,
    value: PropTypes.string,
    url: PropTypes.string.isRequired,
    s3Url: PropTypes.string.isRequired,
  }

  handleFinishedUpload = (info) => {
    this.props.onChange(info.filename)
  }

  render() {
    const { url, s3Url, value, accept, size, maxFileUploadSize } = this.props

    const style = this.props.style || {
      height: size === 'large' ? 200 : 100,
      width: size === 'large' ? 200 : 100,
      border: 'dashed 2px #999',
      borderRadius: 5,
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
    }

    const uploaderProps = {
      style,
      s3Url,
      filename: value,
      maxSize: maxFileUploadSize,
      progressComponent: ({progress}) => progress ? <Progress value={progress} /> : null,

      upload: {
        accept: accept || '',
        server: url,
      },
    }

    return (
      <div>
        {this.props.label ? <label className="control-label">{this.props.label}</label> : null}
        <DropzoneS3Uploader onFinish={this.handleFinishedUpload} {...uploaderProps} />
      </div>
    )
  }
}
