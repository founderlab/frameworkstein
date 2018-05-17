import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { FormGroup, Label, Row, Col, Button } from 'reactstrap'
import { reduxForm, Field, FieldArray } from 'redux-form'


export class ModelDetailForm extends React.Component {

  static propTypes = {
    model: PropTypes.object.isRequired,
    modelAdmin: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  }

  render() {
    const {modelAdmin, model, handleSubmit, onDelete} = this.props

    return (
      <div>
        <Row>
          <Col xs={12}>
            <form>
              {_.map(modelAdmin.fields, (modelField, key) => {
                if (!modelField || modelField.hidden || !modelField.InputComponent) return null
                const FieldComponent = (modelField.type && modelField.type.toLowerCase() === 'json') ? FieldArray : Field
                const fieldName = modelField.virtual_id_accessor || modelField.key || key

                if (modelField.readOnly) {
                  return (
                    <FormGroup key={key}>
                      <Label>{modelField.label || fieldName}</Label>
                      <div>{modelField.display ? modelField.display(model) : (model[fieldName] && model[fieldName].toString())}</div>
                    </FormGroup>
                  )
                }

                return (
                  <FieldComponent
                    key={key}
                    name={fieldName}
                    model={model}
                    modelField={modelField}
                    label={modelField.label || fieldName}
                    component={modelField.InputComponent}
                  />
                )
              })}
            </form>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col xs={12} className="text-right">
            <Button onClick={onDelete} className="mr-3"><i className="fa fa-times" /> Delete</Button>
            <Button color="primary" onClick={handleSubmit}><i className="fa fa-save" /> Save</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default function createModelDetailForm(model) {
  return reduxForm({
    form: 'model_detail',
    initialValues: model,
  })(ModelDetailForm)
}
