
export default options =>
`import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardBody } from 'reactstrap'
import ${options.className}Form from './forms/${options.className}Form'


export default class ${options.className}Create extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    errorMsg: PropTypes.string,
    initialValues: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
  }

  render() {
    const { loading, errorMsg, initialValues, onSubmit } = this.props

    return (
      <div>
        <div className="mb-4">
          <h4>Create a new ${options.className}</h4>
        </div>

        <Card>
          <CardBody className="p-5">

            <${options.className}Form
              loading={loading}
              onSubmit={onSubmit}
              initialValues={initialValues}
              errorMsg={errorMsg}
            />

          </CardBody>
        </Card>
      </div>
    )
  }
}
`
