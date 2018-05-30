import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button, HelpBlock, FormGroup, Label } from 'reactstrap'
import { Field } from 'redux-form'
import { Input } from 'fl-react-utils'


export default function JsonInput(props) {
  const { modelField, fields } = props
  const schema = modelField.schema
  if (!schema) {
    console.log(`Json fields require a jsonSchema property describing the form fields to render. Missing from ${modelField.key}`)
    return null
  }

  return (
    <FormGroup className="json-field">
      <Label>{modelField.label || modelField.key}</Label>
      {modelField.help && <HelpBlock>{modelField.help}</HelpBlock>}

      <div className="json-fields">
        {fields.map((currentItem, i) => (
          <div key={i} className="json-field">
            {_.map(schema, jsonField => {
              if (!jsonField.name) return null
              return (
                <Row key={jsonField.name}>
                  <Col xs={12}>
                    <Field
                      component={Input}
                      {...jsonField}
                      name={`${currentItem}.${jsonField.name}`}
                    />
                  </Col>
                </Row>
              )
            })}

            <Row>
              <Col xs={12} className="text-right">
                <Button bsSize="small" onClick={() => fields.remove(i)}>
                  <i className="fa fa-times" /> Remove
                </Button>
                {i === fields.length-1 && (
                  <Button bsSize="small" onClick={() => fields.push({})} style={{marginLeft: '10px'}}>
                    <i className="fa fa-plus" /> Add another
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        ))}

        {!fields.length && (
          <Row>
            <Col xs={12} className="text-right">
              <Button bsSize="small" onClick={() => fields.push({})} style={{marginLeft: '10px'}}>
                <i className="fa fa-plus" /> Add
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </FormGroup>
  )
}

JsonInput.propTypes = {
  modelField: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
}
