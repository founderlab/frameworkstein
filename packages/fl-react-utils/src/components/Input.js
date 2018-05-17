import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'
import ReactDatetime from 'react-datetime'
import Select from 'react-select'
import { FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import S3Uploader from './S3Uploader'
import { validationError, validationState } from '../validation'
import parseSelectValues from '../parseSelectValues'


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
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    value: PropTypes.any,
    includeEmpty: PropTypes.bool,
    onBlur: PropTypes.func,
    validationState: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.bool,
    ]),
    dateFormat: PropTypes.string,
    className: PropTypes.string,
    localeDateFormat: PropTypes.string,
  }

  static defaultProps = {
    validationState,
    localeDateFormat: 'L',
    type: 'text',
    markdownProps: {
      escapeHtml: true,
    },
  }

  render() {
    const {label, input, meta, helpMd, helpTop, type, className, bsProps, validationState, options} = this.props

    const validation = validationState ? validationState(meta) : null
    const inputProps = _.extend({
      autoComplete: 'on',
      valid: validation === 'success',
      invalid: validation === 'error',
    }, input, this.props.inputProps)

    let help = this.props.help
    if (_.isUndefined(help) && helpMd) {
      help = (<ReactMarkdown source={helpMd} {...this.props.markdownProps} />)
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
        control = (<ReactDatetime closeOnSelect inputProps={{placeholder}} {..._.omit(inputProps, 'onFocus')} />)
        break

      case 'select':
        if (!options) {
          warning(false, 'select components require an options prop')
          return null
        }
        control = (
          <Input type="select" {...inputProps}>
            {this.props.includeEmpty && (<option />)}
            {inputProps.placeholder && (<option>{inputProps.placeholder}</option>)}
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
        const {onChange, onBlur, value, ...props} = inputProps
        const stringValue = _.isArray(value) ? value.join(',') : value
        const funcs = {}
        if (onChange) funcs.onChange = value => onChange(parseSelectValues(value))
        if (onBlur) funcs.onBlur = () => onBlur(value)
        control = (
          <Select
            ref={c => this._select = c}
            options={options}
            value={stringValue}
            onBlurResetsInput={false}
            onCloseResetsInput={false}
            {...funcs}
            {...props}
          />
        )
        break

      case 'image':
      case 'file':
        control = (
          <S3Uploader inputProps={inputProps} />
        )
        break

      case 'static':
        control = (
          <Input plaintext {...bsProps} {...inputProps}>{inputProps.value}</Input>
        )
        break

      case 'checkbox':
      case 'boolean':
        inputProps.checked = !!inputProps.value
        check = true
        const oc = e => inputProps.onChange(e.target.value !== 'true')
        const ob = () => inputProps.onBlur()

        control = (
          <Label check>
            <Input type="checkbox" {...bsProps} {...inputProps} onChange={oc} onBlur={ob} /> {label}
          </Label>
        )
        break

      case 'rich':
      case 'rich-text':
      case 'quill':
        warning(false, 'Rich text editor (quill) has been removed from fl-react-utils/Input. Textarea will be used instead.')
        control = (
          <Input type="textarea" {...bsProps} {...inputProps} />
        )
        break
      case 'textarea':
        control = (
          <Input type="textarea" {...bsProps} {...inputProps} />
        )
        break

      // case 'text':
      // case 'email':
      // case 'password':
      default:
        control = (
          <Input type={type} {...bsProps} {...inputProps} />
        )
    }

    return (
      <FormGroup check={check} className={className}>
        {label && !check && <Label>{label}</Label>}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        {control}
        {error && (<FormFeedback>{error}</FormFeedback>)}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
