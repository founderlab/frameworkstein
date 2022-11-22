import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import DatetimeInput from './DatetimeInput'

export default function DateInput(props) {
  const dateFormat = props.dateFormat || moment.localeData().longDateFormat(props.localeDateFormat)

  return (
    <DatetimeInput
      {...props}
      dateFormat={dateFormat}
      timeFormat={false}
      placeholder={dateFormat}
    />
  )
}

DateInput.propTypes = {
  dateFormat: PropTypes.string,
  localeDateFormat: PropTypes.string,
}

DateInput.defaultProps = {
  inputProps: {},
  localeDateFormat: 'L',
}
