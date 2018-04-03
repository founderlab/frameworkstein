import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Row, Col, Button, HelpBlock} from 'reactstrap'
import {Field} from 'redux-form'
import {Input} from 'fl-react-utils'


export default function JsonInput(props) {
  const {modelField, fields} = props
  const schema = modelField.schema
  if (!schema) {
    console.log(`Json fields require a jsonSchema property describing the form fields to render. Missing from ${modelField.key}`)
    return null
  }

  return (
    <div className="form-group json-field">
      <label className="control-label">{modelField.label || modelField.key}</label>
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
    </div>
  )
}

JsonInput.propTypes = {
  modelField: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
}
