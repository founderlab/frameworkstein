import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDatetime from 'react-datetime'
import Inflection from 'inflection'
import {FormGroup, Label, FormFeedback, FormText} from 'reactstrap'
import {validationError, validationState} from '../validation'


export default class SplitDatetime extends React.Component {

  static propTypes = {
    label: PropTypes.string,
    helpTop: PropTypes.bool,
    help: PropTypes.string,
    defaultHelp: PropTypes.string,
    meta: PropTypes.object,
    input: PropTypes.object,
    inputProps: PropTypes.object,
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    value: PropTypes.any,
    onBlur: PropTypes.func,
    isValidDate: PropTypes.func,
    dateFormat: PropTypes.string,
    localeDateFormat: PropTypes.string,
    timeFormat: PropTypes.string,
  }

  static defaultProps = {
    feedback: false,
    isValidDate: current => current.isAfter(moment().subtract(1, 'day')),
    localeDateFormat: 'L',
    timeFormat: 'hh:mm a',
  }

  constructor() {
    super()
    this.state = {}
  }

  getDateFormat = () => this.props.dateFormat ? this.props.dateFormat : moment.localeData().longDateFormat(this.props.localeDateFormat)

  // Only update on blur
  handleDateChange = () => null

  handleDateBlur = newDate => {
    const value = this.integrateTimeWithDate(newDate)
    this.props.input.onChange(value)
    this.props.input.onBlur(value)
  }

  handleTimeBlur = newDate => {
    this.props.input.onBlur(this.integrateDateWithTime(newDate))
  }

  integrateTimeWithDate = date => {
    const currentTime = moment(this._time.state.inputValue, this.props.timeFormat)
    const newDate = moment(date).hours(currentTime.hours()).minutes(currentTime.minutes())
    return newDate
  }

  integrateDateWithTime = time => {
    const currentDate = moment(this._date.state.inputValue, this.getDateFormat())
    const newDate = currentDate.hours(time.hours()).minutes(time.minutes())
    return newDate
  }

  render() {
    const {label, meta, helpTop} = this.props

    const inputProps = _.extend({}, this.props.input, this.props.inputProps)

    let help = this.props.help
    if (_.isUndefined(help)) {
      help = validationError(meta) || this.props.defaultHelp
    }

    const dateFormat = this.getDateFormat()

    const id = Inflection.dasherize((label || '').toLowerCase())

    const dateInputProps = {
      ref: c => this._date = c,
      dateFormat,
      placeholder: dateFormat,
      timeFormat: false,
      className: 'date',
      closeOnSelect: true,
      onChange: this.handleDateChange,
      onBlur: this.handleDateBlur,
      isValidDate: this.props.isValidDate,
      ..._.omit(inputProps, 'onBlur', 'onChange', 'onFocus'),
    }
    const timeInputProps = {
      ref: c => this._time = c,
      placeholder: '9:00 am',
      dateFormat: false,
      timeFormat: this.props.timeFormat,
      className: 'time',
      closeOnSelect: true,
      onBlur: this.handleTimeBlur,
      ..._.omit(inputProps, 'onBlur', 'onFocus'),
    }
    if (!this.props.meta.dirty && _.isString(inputProps.value)) {
      dateInputProps.value = moment(inputProps.value)
      timeInputProps.value = moment(inputProps.value)
    }
    const dateControl = (<ReactDatetime {...dateInputProps} />)
    const timeControl = (<ReactDatetime {...timeInputProps} />)

    return (
      <FormGroup className="form-group split-datetime">
        {label && (<Label>{label}</Label>)}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        {dateControl}
        {timeControl}
        {error && (<FormFeedback>{error}</FormFeedback>)}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
