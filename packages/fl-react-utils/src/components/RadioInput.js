import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import { validationError } from '../utils/validation'
import markdownProps from '../utils/markdownProps'


export default class RadioInput extends React.PureComponent {

  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    meta: PropTypes.object,
    help: PropTypes.string,
    helpMd: PropTypes.string,
    inline: PropTypes.bool,
    options: PropTypes.array,
    helpTop: PropTypes.bool,
    markdownProps: PropTypes.object,
  }

  static defaultProps = {
    markdownProps,
    options: [],
    helpTop: true,
    inline: true,
  }

  renderOption = (opt, labelProps={}) => {
    const { input, meta } = this.props

    const oc2 = e => {
      input.onChange(e.target.value)
    }
    return (
      <label key={opt.value} className="radio-inline" {...labelProps}>
        <input
          name={input.name}
          value={opt.value}
          type="radio"
          defaultChecked={meta.initial === opt.value}
          onChange={oc2}
        />
        {opt.label}
      </label>
    )
  }

  renderOptionColumn = opt => (
    <Col xs={6} key={opt.value} className="form-check form-check-inline mr-0">
      {this.renderOption(opt, {className: 'radio-inline px-2 py-2', style: {width: '100%'}})}
    </Col>
  )

  renderItems() {
    const { inline, options } = this.props
    if (inline) {
      return (
        <div>
          {options.map(this.renderOption)}
        </div>
      )
    }
    return (
      <Row className="mt-3">
        {options.map(this.renderOptionColumn)}
      </Row>
    )
  }

  render() {
    const { label, meta, helpTop } = this.props
    const error = validationError(meta)

    let help = this.props.help
    if (_.isUndefined(help) && this.props.helpMd) {
      help = (<ReactMarkdown source={this.props.helpMd} {...this.props.markdownProps} />)
    }

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && <FormText color="muted">{help}</FormText>}
        {this.renderItems()}
        {help && !helpTop && <FormText color="muted">{help}</FormText>}
        {error && <FormFeedback>{error}</FormFeedback>}
      </FormGroup>
    )
  }
}
