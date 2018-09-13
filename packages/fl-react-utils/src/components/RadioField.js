import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form'
import { Row, Col, FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import { validationError } from '../validation'


export default class RadioField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    helpTop: PropTypes.bool,
    help: PropTypes.string,
    error: PropTypes.string,
    formMeta: PropTypes.object,
    formSyncErrors: PropTypes.object,
    submitFailed: PropTypes.bool,
    inline: PropTypes.bool,
    options: PropTypes.array,
  }

  static defaultProps = {
    options: [],
    formMeta: {},
    formSyncErrors: {},
    submitFailed: false,
    inline: true,
  }

  renderItemsInline() {
    const { name, options } = this.props
    return (
      <div>
        {options.map(opt => (
          <label key={opt.value} className="radio-inline">
            <Field
              name={name}
              value={opt.value}
              component="input"
              type="radio"
            />
            {opt.label}
          </label>
        ))}
      </div>
    )
  }

  renderItemColumns() {
    const { name, options } = this.props

    return (
      <Row className="mt-3">
        {options.map(opt => (
          <Col xs={6} key={opt.value} className="form-check form-check-inline mr-0">
            <label className="radio-inline px-2 py-2" style={{width: '100%'}}>
              <Field
                name={name}
                value={opt.value}
                component="input"
                type="radio"
              />
              {opt.label}
            </label>
          </Col>
        ))}
      </Row>
    )
  }

  render() {
    const { name, label, inline, help, formMeta, formSyncErrors, submitFailed, helpTop } = this.props
    const meta = {...formMeta[name] || {}, error: formSyncErrors[name], submitFailed}
    const error = this.props.error || validationError(meta)

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        {inline ? this.renderItemsInline() : this.renderItemColumns()}
        {error && (<FormFeedback>{error}</FormFeedback>)}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
