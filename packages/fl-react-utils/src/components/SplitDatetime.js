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

  constructor(props) {
    super()
    this.state = {
      date: moment(props.input.value),
      time: moment(props.input.value),
    }
  }

  getDateFormat = () => this.props.dateFormat ? this.props.dateFormat : moment.localeData().longDateFormat(this.props.localeDateFormat)

  getDate = () => {
    const currentDate = moment(this.state.date)
    const newDate = currentDate.hours(this.state.time.hours()).minutes(this.state.time.minutes())
    return newDate
  }

  handleChange = () => {
    const newDate = this.getDate()
    this.props.input.onChange(newDate)
  }

  handleDateChange = newDate => {
    if (moment.isMoment(newDate)) {
      this.setState({date: newDate}, this.handleChange)
      return
    }
    if (!_.isString(newDate)) return
    if (newDate.length !== 8) return
    const m = moment(newDate, 'DD/MM/YYYY')
    if (!m.isValid()) return

    this.setState({date: m}, this.handleChange)
  }

  handleTimeChange = newTime => {
    if (moment.isMoment(newTime)) {
      this.setState({time: newTime}, this.handleChange)
      return
    }
    if (!_.isString(newTime)) return
    if (newTime.length !== 8) return
    const m = moment(newTime, 'hh:mm A')
    if (!m.isValid()) return

    this.setState({time: m}, this.handleChange)
  }

  render() {
    const {label, meta, helpTop} = this.props
    const inputProps = _.extend({}, this.props.input, this.props.inputProps)

    let help = this.props.help
    if (_.isUndefined(help)) {
      help = validationHelp(meta) || this.props.defaultHelp
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
      isValidDate: this.props.isValidDate,
      ..._.omit(inputProps, 'onChange', 'onFocus'),
      value: this.state.date,
    }
    const timeInputProps = {
      ref: c => this._time = c,
      placeholder: '9:00 am',
      dateFormat: false,
      timeFormat: this.props.timeFormat,
      className: 'time',
      closeOnSelect: true,
      onChange: this.handleTimeChange,
      ..._.omit(inputProps, 'onChange', 'onFocus'),
      value: this.state.time,
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
