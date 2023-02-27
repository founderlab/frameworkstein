import _ from 'lodash' // eslint-disable-line
import moment from 'moment-timezone'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDatetime from 'react-datetime'
import ReactMarkdown from 'react-markdown'
import { Row, Col, FormGroup, Label, FormFeedback, FormText } from 'reactstrap'
import { validationError } from '../utils/validation'


export default class SplitDatetime extends React.Component {

  static propTypes = {
    label: PropTypes.node,
    dateLabel: PropTypes.node,
    timeLabel: PropTypes.node,
    helpTop: PropTypes.bool,
    helpMd: PropTypes.string,
    help: PropTypes.node,
    meta: PropTypes.object,
    input: PropTypes.object,
    inputProps: PropTypes.object,
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
    value: PropTypes.any,
    isValidDate: PropTypes.func,
    dateFormat: PropTypes.string,
    localeDateFormat: PropTypes.string,
    timeFormat: PropTypes.string,
    markdownProps: PropTypes.object,
    defaultTime: PropTypes.object,
    readOnly: PropTypes.bool,
    inline: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    isValidDate: current => current.isAfter(moment().subtract(1, 'day')),
    localeDateFormat: 'L',
    timeFormat: 'hh:mm a',
    markdownProps: {
      escapeHtml: true,
    },
    defaultTime: {
      hours: 18,
    },
    readOnly: true,
  }

  constructor(props) {
    super()
    this.state = {
      date: moment(props.input.value),
      time: moment(props.input.value),
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      date: moment(props.input.value),
      time: moment(props.input.value),
    })
  }

  getDateFormat = () => this.props.dateFormat ? this.props.dateFormat : moment.localeData().longDateFormat(this.props.localeDateFormat)

  getDate = () => {
    let currentDate = moment(this.state.date)
    if (!currentDate.isValid()) currentDate = moment()
    const newDate = currentDate.hours(this.state.time.hours()).minutes(this.state.time.minutes())
    return newDate
  }

  handleChange = () => {
    const newDate = this.getDate()
    this.props.input.onChange(newDate)
  }

  handleDateChange = newDate => {
    if (moment.isMoment(newDate)) {
      if (this.props.defaultTime) newDate.set(this.props.defaultTime)
      this.setState({date: newDate}, this.handleChange)
      return
    }
    if (!_.isString(newDate)) return
    if (newDate.length !== 8) return
    const m = moment(newDate, 'DD/MM/YYYY')
    if (!m.isValid()) return
    if (this.props.defaultTime) m.set(this.props.defaultTime)

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
    const { label, dateLabel, timeLabel, meta, helpMd, helpTop, readOnly, inline, className } = this.props
    const inputProps = _.extend({}, this.props.input, this.props.inputProps)

    let help = this.props.help
    if (_.isUndefined(help) && helpMd) {
      help = <ReactMarkdown source={helpMd} {...this.props.markdownProps} />
    }
    const error = validationError(meta)
    const dateFormat = this.getDateFormat()

    const dateInputProps = {
      ref: c => this._date = c,
      dateFormat,
      placeholder: dateFormat,
      timeFormat: false,
      className: 'date',
      closeOnSelect: true,
      onChange: this.handleDateChange,
      isValidDate: this.props.isValidDate,
      inputProps: {
        readOnly,
        className: error ? 'is-invalid form-control' : 'form-control',
      },
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
      inputProps: {
        readOnly,
      },
      ..._.omit(inputProps, 'onChange', 'onFocus'),
      value: this.state.time,
    }

    if (!this.props.meta.dirty && _.isString(inputProps.value)) {
      dateInputProps.value = moment(inputProps.value)
      timeInputProps.value = moment(inputProps.value)
    }

    const dateControl = (<ReactDatetime {...dateInputProps} />)
    const timeControl = (<ReactDatetime {...timeInputProps} />)

    let controls
    if (inline) {
      controls = (
        <Row>
          <Col xs={6}>
            {dateLabel && (<Label>{dateLabel}</Label>)}
            {dateControl}
          </Col>
          {error && (<FormFeedback>{error}</FormFeedback>)}
          <Col xs={6}>
            {timeLabel && (<Label>{timeLabel}</Label>)}
            {timeControl}
          </Col>
        </Row>
      )
    }
    else {
      controls = (
        <React.Fragment>
          <div>
            {dateLabel && (<Label>{dateLabel}</Label>)}
            {dateControl}
          </div>
          {error && (<FormFeedback>{error}</FormFeedback>)}
          <div className="mt-3">
            {timeLabel && (<Label>{timeLabel}</Label>)}
            {timeControl}
          </div>
        </React.Fragment>
      )
    }

    return (
      <FormGroup className={className || 'form-group split-datetime'}>
        {label && (<Label>{label}</Label>)}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        {controls}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
