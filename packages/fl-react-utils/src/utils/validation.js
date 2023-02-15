import _ from 'lodash'
import moment from 'moment-timezone'


// Validation highlighting for react-bootstrap Input components
export function validationState(field) {
  if (!field || !field.submitFailed) return null
  if (field.error) return 'error'
  if (field.dirty) return 'success'
}

// Validation highlighting for other input components
export function validationStyle(field) {
  if (!field || !field.submitFailed) return null
  if (field.error) return 'has-error'
  if (field.dirty) return 'has-success'
}

// Validation highlighting for other input components
export function validationProps(field) {
  if (!field || !field.submitFailed) return {}
  if (field.error) return {invalid: true}
  if (field.dirty) return {valid: true}
}

// Validation error text if field submitted
export function validationError(field) {
  if (!field || !field.submitFailed) return null
  return field.error || null
}

export function validDate(current) {
  const yesterday = moment().subtract(1, 'day')
  return current.isAfter(yesterday)
}

export function allFieldsRequiredFn(...args) {
  const fieldNames = _.isArray(args[0]) ? args[0] : args
  return data => {
    const errors = {}
    fieldNames.forEach(fieldName => {
      if (!data[fieldName]) errors[fieldName] = 'This field is required'
    })
    return errors
  }
}
