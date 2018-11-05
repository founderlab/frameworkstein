import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Label, Input } from 'reactstrap'


export default class Checkbox extends React.PureComponent {

  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    const { children, ...rest } = this.props

    return (
      <div className="form-check form-check-inline">
        <Label check className="px-2 py-2">
          <Input type="checkbox" {...rest} />{' '}
          {children}
        </Label>
      </div>
    )
  }
}
