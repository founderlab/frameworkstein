import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import DropzoneS3Uploader from 'react-dropzone-s3-uploader'
import { Row, Col, FormGroup, Label, FormText, ProgressBar } from 'reactstrap'
import { S3Image } from 'fl-react-utils'
import Avatar from '../components/Avatar'


const MAX_FILE_SIZE = 1024 * 1024 * 10 //10mb

export default class AvatarUploader extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    help: PropTypes.string,
    validationState: PropTypes.string,
    filename: PropTypes.string,
    profile: PropTypes.object.isRequired,
    input: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    autoSave: PropTypes.bool,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
    s3Url: PropTypes.string.isRequired,
  }

  constructor() {
    super()
    this.state = {editing: false}
  }

  handleToggleEdit = () => {
    this.setState({editing: !this.state.editing})
  }

  handleFinishedUpload = info => {
    this.setState({editing: false})
    this.props.input.onChange(info.filename)
    if (!this.props.autoSave) return
    const profile = _.assign({}, this.props.profile, {avatarImage: info.filename})
    this.props.save(profile, err => {
      if (err) console.log(err)
    })
  }

  render() {
    const { name, label, help, validationState } = this.props
    const filename = this.props.input.value

    const uploaderProps = {
      style: this.props.style || {},
      s3Url: this.context.s3Url,
      progressComponent: ({progress}) => (<ProgressBar to={progress} />),
      passChildrenProps: false,
      onFinish: this.handleFinishedUpload,
      maxSize: MAX_FILE_SIZE,
      upload: {
        server: this.context.url,
      },
    }

    return (
      <FormGroup className="profile-editor text-center" validationState={validationState}>
        <Row>
          <Col xs={12}>
            {label && <Label>{label}</Label>}
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <DropzoneS3Uploader {...uploaderProps}>
              {filename ? (
                <div className="avatar"><S3Image className="avatar" filename={filename} /></div>
              ) : (
                <Avatar profile={this.props.profile} size="lg" />
              )}
            </DropzoneS3Uploader>
          </Col>
        </Row>
        <Row>
          {help && <FormText>{help}</FormText>}
        </Row>
      </FormGroup>
    )
  }
}
