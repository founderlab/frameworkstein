/* eslint-env browser */
import React from 'react'
import PropTypes from 'prop-types'
import ReactSelect from 'react-select'
import { parseSelectValues, selectOptionFromValue } from '../utils/selectUtils'


export default class Select extends React.PureComponent {

  static propTypes = {
    value: PropTypes.any,
    multi: PropTypes.bool,
    isMulti: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    className: PropTypes.any,
    classNamePrefix: PropTypes.string,
  }

  static defaultProps = {
    className: 'react-select',
    classNamePrefix: 'react-select',
  }

  render() {
    const multi = this.props.multi || this.props.isMulti
    const onChange = value => this.props.onChange(parseSelectValues(value, multi))
    const value = selectOptionFromValue(this.props)

    return (
      <ReactSelect
        {...this.props}
        isMulti={multi}
        onChange={onChange}
        value={value}
      />
    )
  }
}
