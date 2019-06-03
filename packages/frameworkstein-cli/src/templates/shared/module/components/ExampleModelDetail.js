
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
        {_.map(${options.variableName}, (value, key) => {
          return <p key={key}>{key}: {value ? value.toString() : ''}</p>
        })}
        <p><Link to={`/${options.variablePlural}/$\{${options.variableName}.id\}/edit`}>edit</Link></p>
      </div>
    )
  }
}
`
