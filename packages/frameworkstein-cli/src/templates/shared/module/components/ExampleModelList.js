
export default options =>
`import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Row, Col } from 'reactstrap'


export default class ${options.className}List extends React.PureComponent {

  static propTypes = {
    ${options.variablePlural}: PropTypes.array.isRequired,
  }

  render() {
    const { ${options.variablePlural} } = this.props

    return (
      <React.Fragment>
        {_.map(${options.variablePlural}, ${options.variableName} => (
          <Row key={${options.variableName}.id}>
            <Col>
              <p><Link to={\`/${options.variablePlural}/$\{${options.variableName}.id}\`}>${options.className} {${options.variableName}.id}</Link></p>
            </Col>
            <Col xs="auto" className="ms-auto">
              <p><Button size="sm" color="link" tag={Link} to={\`/${options.variablePlural}/$\{${options.variableName}.id}/edit\`}><i className="fa fa-pencil" /> edit</Button></p>
            </Col>
          </Row>
        ))}
        <Row className="mt-4">
          <Col>
            <p><Button tag={Link} to="/${options.variablePlural}/create"><i className="fa fa-plus" /> Create ${options.className}</Button></p>
          </Col>
        </Row>
      </React.Fragment>
    )
  }
}
`
