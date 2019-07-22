

export default options =>
`import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'


export default class ${options.className}Detail extends React.PureComponent {

  static propTypes = {
    ${options.variableName}: PropTypes.object.isRequired,
  }

  render() {
    const { ${options.variableName} } = this.props

    return (
      <div>
        <p>${options.className} {${options.variableName}.id}</p>
      </div>
    )
  }
}
`
