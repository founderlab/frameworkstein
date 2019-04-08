

export default options =>
`import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'


export default class ${options.className}List extends React.PureComponent {

  static propTypes = {
    ${options.variablePlural}: PropTypes.array.isRequired,
  }

  render() {
    const { ${options.variablePlural} } = this.props

    return (
      <div>
        {_.map(${options.variablePlural}, ${options.variableName} => (
          <Link to={'${options.variablePlural}/'+${options.variableName}.id}>${options.className} {${options.variableName}.id}</Link>
        ))}
      </div>
    )
  }
}
`
