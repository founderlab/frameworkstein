import React from 'react'
import PropTypes from 'prop-types'
import { Card, CardBody } from 'reactstrap'
import { ResetForm } from 'fl-auth-react'


export default class Reset extends React.PureComponent {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }

  render() {
    return (
      <section className="py-5">
        <h4>Enter a new password</h4>
        <Card>
          <CardBody>
            <ResetForm {...this.props} />
          </CardBody>
        </Card>
      </section>
    )
  }
}
