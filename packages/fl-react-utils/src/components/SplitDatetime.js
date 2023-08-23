import _ from 'lodash' // eslint-disable-line
import moment from 'moment-timezone'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDatetime from 'react-datetime'
import ReactMarkdown from 'react-markdown'
import { Row, Col, FormGroup, Label, FormFeedback, FormText } from 'reactstrap'
import { validationError } from '../utils/validation'


export default function SplitDatetime(props) {
  const { timezone, input, meta, label, dateLabel, timeLabel, helpMd, helpTop, readOnly, inline, className, markdownProps, defaultTime, isValidDate, timeFormat } = props
  const inputProps = { ...input, ...props.inputProps }

  const momentDateFromDate = date => {
    let m = moment(date || new Date())
    if (timezone) m = m.tz(timezone)
    // set default time if no initial value
    if (!date && defaultTime) m.set(defaultTime)
    return m
  }
  const [date, setDate] = React.useState(input.value && momentDateFromDate(input.value))
  const dateFormat = props.dateFormat || moment.localeData().longDateFormat(props.localeDateFormat)

  const handleChange = (value, triggerInputChange) => {
    const newDate = momentDateFromDate(value)
    if (!newDate || newDate.isValid()) return  // don't update if invalid
    setDate(newDate)
    if (triggerInputChange) input.onChange(newDate.toDate())
  }

  const handleDateChange = newDate => {
    if (moment.isMoment(newDate)) {
      return handleChange(newDate, true)
    }
    if (!_.isString(newDate)) return
    if (newDate.length !== 8) return
    let m = moment(newDate, 'DD/MM/YYYY')
    if (timezone) m = m.tz(timezone)
    if (!m.isValid()) return

    handleChange(m, true)
  }

  const handleTimeChange = newTime => {
    if (moment.isMoment(newTime)) {
      handleChange(newTime, true)
      return
    }
    if (!_.isString(newTime)) return
    if (newTime.length !== 8) return
    const parsedTime = moment(newTime, 'hh:mm A')
    if (!parsedTime.isValid()) return
    const newDate = date.minutes(parsedTime.minutes()).hours(parsedTime.hours())
    handleChange(newDate, true)
  }

  React.useEffect(() => {
    handleChange(date.tz(timezone, true), true)
  }, [timezone])

  React.useEffect(() => {
    if (!input.value) return
    if (moment(input.value).isSame(date)) return
    handleChange(input.value, false)
  }, [input.value])

  let help = props.help
  if (_.isUndefined(help) && helpMd) {
    help = <ReactMarkdown source={helpMd} {...markdownProps} />
  }
  const error = validationError(meta)

  const dateInputProps = {
    dateFormat,
    placeholder: dateFormat,
    timeFormat: null,
    className: 'date',
    closeOnSelect: true,
    onChange: handleDateChange,
    isValidDate,
    inputProps: {
      readOnly,
      className: error ? 'is-invalid form-control' : 'form-control',
    },
    ..._.omit(inputProps, 'onChange', 'onFocus'),
    value: date,
  }

  const timeInputProps = {
    timeFormat,
    placeholder: '9:00 am',
    dateFormat: null,
    className: 'time',
    closeOnSelect: true,
    onChange: handleTimeChange,
    inputProps: {
      readOnly,
    },
    ..._.omit(inputProps, 'onChange', 'onFocus'),
    value: date,
  }

  if (!meta.dirty && _.isString(inputProps.value)) {
    dateInputProps.value = moment(inputProps.value)
    timeInputProps.value = moment(inputProps.value)
  }

  const dateControl = <ReactDatetime {...dateInputProps} />
  const timeControl = <ReactDatetime {...timeInputProps} />

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
    <FormGroup className={className || 'split-datetime'}>
      {label && (<Label>{label}</Label>)}
      {help && helpTop && (<FormText color="muted">{help}</FormText>)}
      {controls}
      {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
    </FormGroup>
  )
}

SplitDatetime.propTypes = {
  timezone: PropTypes.string,
  label: PropTypes.node,
  dateLabel: PropTypes.node,
  timeLabel: PropTypes.node,
  helpTop: PropTypes.bool,
  helpMd: PropTypes.string,
  help: PropTypes.node,
  meta: PropTypes.object,
  input: PropTypes.object.isRequired,
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

SplitDatetime.defaultProps = {
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
  inputProps: {},
}
