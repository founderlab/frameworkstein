
export default options =>
`import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardBody } from 'reactstrap'
import ${options.className}Form from './forms/${options.className}Form'


export default class ${options.className}Edit extends React.PureComponent {

  static propTypes = {
    ${options.variableName}: PropTypes.object,
  }

  render() {
    const { ${options.variableName} } = this.props

    return (
      <div>
        <div className="mb-4">
          <h4></h4>
        </div>

        <Card>
          <CardBody className="p-5">

            <${options.className}Form
              form="${options.variableName}Edit"
              initialValues={${options.variableName}}
              {...this.props}
            />

          </CardBody>
        </Card>
      </div>
    )
  }
}
`
