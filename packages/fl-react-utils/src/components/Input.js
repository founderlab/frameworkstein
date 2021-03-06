/* eslint-env browser */
import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'
import ReactDatetime from 'react-datetime'
import { FormGroup, Label, Input, FormText, FormFeedback, Row, Col, InputGroup, InputGroupAddon } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import Select from './Select'
import S3Uploader from './S3Uploader'
import { validationError, validationState } from '../utils/validation'
import markdownProps from '../utils/markdownProps'


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
  }

  static defaultProps = {
    validationState,
    markdownProps,
    localeDateFormat: 'L',
    type: 'text',
    helpTop: true,
    autoScrollWidth: 576,
  }

  focus = () => this._input && this._input.focus && this._input.focus()

  render() {
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
      case 'date':
      case 'datetime':
      case 'time':
        let placeholder = 'DD/MM/YYYY 9:00 am'
        inputProps.dateFormat = this.props.dateFormat || moment.localeData().longDateFormat(this.props.localeDateFormat)
        if (type === 'date') {
          placeholder = inputProps.dateFormat
          inputProps.timeFormat = false
          if (!meta.dirty && _.isString(inputProps.value)) inputProps.value = moment(inputProps.value)
        }
        else if (type === 'time') {
          placeholder = '9:00 am'
          inputProps.dateFormat = false
          inputProps.timeFormat = 'hh:mm a'
          if (!meta.dirty && _.isString(inputProps.value)) inputProps.value = moment(inputProps.value)
        }
        else if (!meta.dirty && _.isString(inputProps.value)) {
          inputProps.value = moment(inputProps.value)
        }
        control = <ReactDatetime closeOnSelect inputProps={{placeholder}} {..._.omit(inputProps, 'onFocus', 'onBlur')} />
        break

      case 'select':
        if (!options) {
          warning(false, 'select components require an options prop')
          return null
        }
        control = (
          <Input type="select" {...inputProps}>
            {this.props.includeEmpty && <option />}
            {inputProps.placeholder && <option value="">{inputProps.placeholder}</option>}
            {_.map(options, opt => {
              const option = _.isObject(opt) ? opt : {label: opt, value: opt}
              return (
                <option key={option.value} value={option.value}>{option.label}</option>
              )
            })}
          </Input>
        )
        break

      case 'react-select':
        if (!options) {
          warning(false, 'react-select components require an options prop')
          return null
        }
        const { onBlur, ...props } = inputProps
        control = <Select options={options} {...props} />
        break

      case 'image':
      case 'file':
        control = <S3Uploader type={type} {...inputProps} />
        break

      case 'checkbox':
        inputProps.checked = !!inputProps.value
        check = true
        const oc = e => inputProps.onChange(e.target.value !== 'true')

        control = (
          <Label check>
            <Input type="checkbox" {...bsProps} {...inputProps} onChange={oc} /> {label}
          </Label>
        )
        break

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
        <Row>
          <Col>
            {label && !check && <Label>{label}</Label>}
            {help && helpTop && <FormText color="muted">{help}</FormText>}
            {control}
            {error && <FormFeedback>{error}</FormFeedback>}
            {help && !helpTop && <FormText color="muted">{help}</FormText>}
          </Col>
        </Row>
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
