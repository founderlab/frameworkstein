import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import ReactDatetime from 'react-datetime'
import InputContainer from './InputContainer'


export default function DatetimeInput(props) {
  const { input, meta, dateFormat, timeFormat, placeholder, localeDateFormat, inputProps } = props

  const _dateFormat = props.dateFormat || moment.localeData().longDateFormat(localeDateFormat)
  if (!meta.dirty && _.isString(input.value)) input.value = moment(input.value)

  return (
    <InputContainer {...props}>
      {innerProps => (
        <ReactDatetime
          inputProps={{
            placeholder,
            ...inputProps,
          }}
          {..._.omit(input, 'onFocus', 'onBlur')}
          dateFormat={_dateFormat}
          timeFormat={timeFormat}
          {...innerProps}
        />
      )}
    </InputContainer>
  )
}

DatetimeInput.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  inputProps: PropTypes.object,
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.string,
  localeDateFormat: PropTypes.string,
  closeOnSelect: PropTypes.bool,
}

DatetimeInput.defaultProps = {
  inputProps: {},
  localeDateFormat: 'L',
  placeholder: 'DD/MM/YYYY 9:00 am',
  closeOnSelect: true,
}
