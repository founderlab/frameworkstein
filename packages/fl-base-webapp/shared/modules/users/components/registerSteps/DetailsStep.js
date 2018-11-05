/* eslint-disable react/no-array-index-key */
import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { FormText, Card, CardBody, Row, Col } from 'reactstrap'
import { reduxForm, Field } from 'redux-form'
import { Input, RadioField } from 'fl-react-utils'
import validateProfile from '../../validation'


@reduxForm({
  form: 'details-step-form',
  validate: validateProfile,
})
export default class DetailsStep extends React.PureComponent {

  static propTypes = {
    profile: PropTypes.object.isRequired,
    errorMsg: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    renderButtons: PropTypes.func.isRequired,
    fromSocial: PropTypes.bool, // flag if the user signed up cvia linkedin, etc and we want to confirm their name
  }

  render() {
    const { profile, errorMsg, renderButtons, handleSubmit, fromSocial } = this.props

    return (
      <div>
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            {profile.firstName && <p className="text-muted">Hello {profile.firstName}</p>}
            <h4>Please confirm your personal details</h4>
          </div>

          <Card>
            <CardBody className="p-5">

              {fromSocial && (
                <Row>
                  <Col xs={12} sm={6}>
                    <Field
                      name="firstName"
                      label="First name *"
                      inputProps={{placeholder: 'Nicolas'}}
                      component={Input}
                    />
                  </Col>

                  <Col xs={12} sm={6}>
                    <Field
                      name="lastName"
                      label="Last name *"
                      inputProps={{placeholder: 'Cage'}}
                      component={Input}
                    />
                  </Col>
                </Row>
              )}

              <Row>
                <Col xs={12}>
                  <Field
                    type="email"
                    name="contactEmail"
                    label="Contact email"
                    inputProps={{placeholder: 'hello@example.com'}}
                    component={Input}
                    help="This email will be visible to other users of the site. Leave it blank if you don't want to have a public contact email."
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <RadioField
                    name="gender"
                    label="Gender"
                    options={[
                      {label: 'Male', value: 'male'},
                      {label: 'Female', value: 'female'},
                      {label: 'Prefer not to say', value: 'other'},
                    ]}
                    help="Your gender won’t be visible to other users. It's used for reporting purposes only."
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12} sm={6}>
                  <Field
                    name="city"
                    label="City"
                    inputProps={{placeholder: 'City'}}
                    component={Input}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Field
                    name="country"
                    label="Country"
                    inputProps={{placeholder: 'Country'}}
                    component={Input}
                  />
                </Col>
              </Row>

              {errorMsg && (
                <FormText>{errorMsg}</FormText>
              )}
            </CardBody>
          </Card>

          {renderButtons()}

        </form>
      </div>
    )
  }
}
