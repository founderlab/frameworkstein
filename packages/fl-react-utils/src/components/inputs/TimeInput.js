import React from 'react'
import PropTypes from 'prop-types'
import DatetimeInput from './DatetimeInput'


export default function TimeInput(props) {
  return (
    <DatetimeInput
      {...props}
      dateFormat={false}
      timeFormat="hh:mm a"
      placeholder="9:00 am"
    />
  )
}

TimeInput.propTypes = {
  dateFormat: PropTypes.string,
  localeDateFormat: PropTypes.string,
}

TimeInput.defaultProps = {
  inputProps: {},
  localeDateFormat: 'L',
}
