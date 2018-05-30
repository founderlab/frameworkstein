import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

export default class SelectForm extends React.Component {

  static propTypes = {
    loadOptions: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.string,
    placeholder: PropTypes.string,
  }

  handleChange = (value, options) => {
    if (this.props.onChange && options) {
      this.props.onChange(options[0])
    }
  }

  render() {
    const { loadOptions, value, placeholder } = this.props

    return (
      <Select cacheAsyncResults={false} loadOptions={loadOptions} onChange={this.handleChange} value={value} placeholder={placeholder} />
    )
  }
}
