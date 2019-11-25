import _ from 'lodash'
import warning from 'warning'


export function parseSelectValues(values, multi) {
  if (!values) return multi ? [] : ''
  if (_.isArray(values)) return _.map(values, v => v.value)
  if (_.isObject(values)) return values.value
  if (_.isString(values)) return values.split(',')
  warning(false, `[fl-react-utils] parseSelectValues: react-select gave a strange value: ${JSON.stringify(values)}`)
  return []
}

export function selectOptionFromValue(opts) {
  const { value, options } = opts
  const multi = opts.multi || opts.isMulti

  if (multi) {
    const values = value
    return _.filter(options, o => _.includes(values, o.value))
  }

  return _.find(options, o => o.value === value)
}
