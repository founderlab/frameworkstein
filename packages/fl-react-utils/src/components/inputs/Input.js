/* eslint-env browser */
import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'
import { FormGroup, Label, Input, FormText, FormFeedback, Row, Col, InputGroup, InputGroupAddon } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import Select from '../Select'
import S3Uploader from '../S3Uploader'
import DateInput from './DateInput'
import DatetimeInput from './DatetimeInput'
import TimeInput from './TimeInput'
import SelectInput from './SelectInput'
import ReactSelectInput from './ReactSelectInput'
import RadioInput from './RadioInput'
import CheckboxInput from './CheckboxInput'
import S3UploaderInput from './S3UploaderInput'
import { validationError, validationState } from '../../utils/validation'
import markdownProps from '../../utils/markdownProps'


export default class FLInput extends React.Component {

  static propTypes = {
    label: PropTypes.node,
    id: PropTypes.string,
    name: PropTypes.string,
    help: PropTypes.node,
    helpMd: PropTypes.string,
    helpTop: PropTypes.bool,
    type: PropTypes.string,
    bsProps: PropTypes.object,
    meta: PropTypes.object,
    input: PropTypes.object,
    inputProps: PropTypes.object,
    markdownProps: PropTypes.object,
    autoScrollWidth: PropTypes.number,
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    value: PropTypes.any,
    inline: PropTypes.bool,
    includeEmpty: PropTypes.bool,
    onBlur: PropTypes.func,
    validationState: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.bool,
    ]),
    dateFormat: PropTypes.string,
    className: PropTypes.string,
    localeDateFormat: PropTypes.string,
    prepend: PropTypes.node,
    append: PropTypes.node,
    fat: PropTypes.bool,
    icon: PropTypes.string,
  }

  static defaultProps = {
    validationState,
    markdownProps,
    type: 'text',
    autoScrollWidth: 576,
  }

  focus = () => this._input && this._input.focus && this._input.focus()

  render() {
    switch (this.props.type) {
      case 'date':
        return <DateInput {...this.props} />
      case 'datetime':
        return <DatetimeInput {...this.props} />
      case 'time':
        return <TimeInput {...this.props} />
      case 'select':
        return <SelectInput {...this.props} />
      case 'react-select':
        return <ReactSelectInput {...this.props} />
      case 'checkbox':
        return <CheckboxInput {...this.props} />
      case 'radio-list':
        return <RadioInput {...this.props} />
      case 'image':
      case 'file':
        return <S3UploaderInput {...this.props} />
    }

    const { label, input, meta, helpMd, helpTop, type, className, bsProps, validationState, prepend, append, options } = this.props

    const validation = validationState ? validationState(meta) : null
    const inputProps = _.extend({
      autoComplete: 'on',
      valid: validation === 'success',
      invalid: validation === 'error',
      ref: c => this._input = c,
    }, input, this.props.inputProps)

    let help = this.props.help
    if (_.isUndefined(help) && helpMd) {
      help = <ReactMarkdown source={helpMd} {...this.props.markdownProps} />
    }
    const error = validationError(meta)
    let check = false
    let control

    switch (type) {
      case 'boolean':
        if (_.isBoolean(inputProps.value)) inputProps.value = inputProps.value ? 'true' : 'false'
        const oc2 = e => inputProps.onChange(e.target.value === 'true')

        const _options = (options && options.length) ? options : [{label: inputProps.trueLabel || 'Yes', value: 'true'}, {label: inputProps.falseLabel || 'No', value: 'false'}]

        control = (
          <div>
            {_.map(_options, opt => (
              <Label key={opt.value} className="radio-inline">
                <input type="radio" name={inputProps.name} value={opt.value} checked={inputProps.value == opt.value} onChange={oc2} /> {opt.label}
              </Label>
            ))}
          </div>
        )
        break

      case 'static':
        inputProps.innerRef = inputProps.ref
        inputProps.ref = null
        control = <Input plaintext value={inputProps.value} {...bsProps} {...inputProps} />
        break

      case 'rich':
      case 'rich-text':
      case 'quill':
      case 'textarea':
        inputProps.innerRef = inputProps.ref
        inputProps.ref = null
        control = <Input type="textarea" {...bsProps} {...inputProps} />
        break

      // case 'text':
      // case 'email':
      // case 'password':
      default:
        inputProps.innerRef = inputProps.ref
        inputProps.ref = null
        control = (
          <Input type={type} {...bsProps} {...inputProps} />
        )
        if (prepend || append) {
          control = (
            <InputGroup>
              {prepend && (
                <InputGroupAddon addonType="prepend">
                  <InputGroupAddon addonType="prepend">{prepend}</InputGroupAddon>
                </InputGroupAddon>
              )}
              {control}
              {append && (
                <InputGroupAddon addonType="append">
                  <InputGroupAddon addonType="append">{append}</InputGroupAddon>
                </InputGroupAddon>
              )}
            </InputGroup>
          )
        }
    }

    let content = null
    if (this.props.inline) {
      content = (
        <Row>
          <Col>
            {label && !check && <Label>{label}</Label>}
            {help && helpTop && <FormText color="muted">{help}</FormText>}
            {error && <FormFeedback>{error}</FormFeedback>}
            {help && !helpTop && <FormText color="muted">{help}</FormText>}
          </Col>
          <Col>
            {control}
          </Col>
        </Row>
      )
    }
    else {
      content = (
        <>
          {label && !check && <Label>{label}</Label>}
          {help && helpTop && <FormText color="muted">{help}</FormText>}
          {control}
          {error && <FormFeedback>{error}</FormFeedback>}
          {help && !helpTop && <FormText color="muted">{help}</FormText>}
        </>
      )
    }

    return (
      <FormGroup check={check} className={className}>
        <div ref={c => this._scrollEle = c} />
        {content}
      </FormGroup>
    )
  }
}
