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
    inputProps: PropTypes.object.isRequired,
    config: PropTypes.object,
  }

  static defaultProps = {
    config: {},
  }

  static contextTypes = {
    url: PropTypes.string,
    s3Url: PropTypes.string,
  }

  handleFinishedUpload = (info) => {
    this.props.inputProps.onChange(info.filename)
  }

  render() {
    const {config, size, inputProps} = this.props

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
      s3Url: config.s3Url || this.context.s3Url,
      filename: inputProps.value,
      maxSize: config.maxFileUploadSize,
      progressComponent: ({progress}) => progress ? (<Progress value={progress} />) : null,

      upload: {
        accept: inputProps.accept || '',
        server: config.url || this.context.url,
      },
    }

    return (
      <div>
        {this.props.label ? (<label className="control-label">{this.props.label}</label>) : null}
        <DropzoneS3Uploader onFinish={this.handleFinishedUpload} {...uploaderProps} />
      </div>
    )
  }
}
