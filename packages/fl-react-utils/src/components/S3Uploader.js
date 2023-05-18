import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import DropzoneS3Uploader from 'react-dropzone-s3-uploader'
import { Progress, FormFeedback } from 'reactstrap'


export default class S3Uploader extends React.Component {

  static propTypes = {
    label: PropTypes.node,
    size: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    maxFileUploadSize: PropTypes.number,
    accept: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
    url: PropTypes.string.isRequired,
    s3Url: PropTypes.string.isRequired,
  }

  state = {
    error: '',
  }

  handleFinishedUpload = (info) => {
    this.props.onChange(info.filename)
  }

  handlePreprocess = (file, next) => {
    const { type, maxFileUploadSize } = this.props
    if (file.size > maxFileUploadSize) {
      const error = type === 'image' ?
        `Image size should be less than ${maxFileUploadSize/1024}kb, please resize your image or use a smaller one.` :
        `File size should be less than ${maxFileUploadSize/1024}kb, please select a smaller file.`
      this.setState({error})
    }
    else {
      this.setState({error: ''})
      next(file)
    }
  }

  render() {
    const { url, s3Url, value, accept, size, height, width } = this.props

    const style = this.props.style || {
      height: height || (size === 'large' ? 200 : 100),
      width: width || (size === 'large' ? 200 : 100),
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
      progressComponent: ({progress}) => progress ? <Progress value={progress} /> : null,

      upload: {
        accept: accept || '',
        server: url,
        preprocess: this.handlePreprocess,
      },
    }

    return (
      <div>
        {this.props.label ? <label className="control-label">{this.props.label}</label> : null}
        <DropzoneS3Uploader onFinish={this.handleFinishedUpload} {...uploaderProps} />
        {this.state.error && <FormFeedback>{this.state.error}</FormFeedback>}
      </div>
    )
  }
}
