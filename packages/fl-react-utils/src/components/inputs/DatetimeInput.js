import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import ReactDatetime from 'react-datetime'
import InputContainer from './InputContainer'


export default function DatetimeInput(props) {
  const { meta, timeFormat, placeholder, localeDateFormat, inputProps } = props

  const dateFormat = props.dateFormat || moment.localeData().longDateFormat(localeDateFormat)
  const input = {...props.input}
  if (!meta.dirty && _.isString(input.value)) input.value = moment(input.value)

  return (
    <InputContainer {...props}>
      {innerProps => (
        <ReactDatetime
          {...innerProps}
          inputProps={{
            placeholder,
            ...inputProps,
          }}
          {..._.omit(input, 'onFocus', 'onBlur')}
          dateFormat={dateFormat}
          timeFormat={timeFormat}
        />
      )}
    </InputContainer>
  )
}

DatetimeInput.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  inputProps: PropTypes.object,
  placeholder: PropTypes.string,
  dateFormat: PropTypes.oneOfType(PropTypes.string, PropTypes.bool),
  timeFormat: PropTypes.oneOfType(PropTypes.string, PropTypes.bool),
  localeDateFormat: PropTypes.string,
  closeOnSelect: PropTypes.bool,
}

DatetimeInput.defaultProps = {
  inputProps: {},
  localeDateFormat: 'L',
  placeholder: 'DD/MM/YYYY 9:00 am',
  closeOnSelect: true,
}
