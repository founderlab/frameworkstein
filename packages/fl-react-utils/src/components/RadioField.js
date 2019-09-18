import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Field, getFormSyncErrors, hasSubmitFailed } from 'redux-form'
import { connect } from 'react-redux'
import { Row, Col, FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import { validationError } from '../validation'
import markdownProps from '../markdownProps'


@connect((state, props) => ({
  formSyncErrors: getFormSyncErrors(props.form)(state),
  submitFailed: hasSubmitFailed(props.form)(state),
}))
export default class RadioField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    helpTop: PropTypes.bool,
    help: PropTypes.string,
    helpMd: PropTypes.string,
    error: PropTypes.string,
    formMeta: PropTypes.object,
    formSyncErrors: PropTypes.object,
    submitFailed: PropTypes.bool,
    inline: PropTypes.bool,
    options: PropTypes.array,
    validate: PropTypes.func,
  }

  static defaultProps = {
    markdownProps,
    options: [],
    formMeta: {},
    formSyncErrors: {},
    submitFailed: false,
    inline: true,
  }

  renderItemsInline() {
    const { name, options, validate } = this.props
    return (
      <div>
        {options.map(opt => (
          <label key={opt.value} className="radio-inline">
            <Field
              name={name}
              value={opt.value}
              component="input"
              type="radio"
              validate={validate}
            />
            {opt.label}
          </label>
        ))}
      </div>
    )
  }

  renderItemColumns() {
    const { name, options, validate } = this.props

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
                validate={validate}
              />
              {opt.label}
            </label>
          </Col>
        ))}
      </Row>
    )
  }

  render() {
    const { name, label, inline, formMeta, formSyncErrors, submitFailed, helpTop } = this.props
    const meta = {...formMeta[name] || {}, error: formSyncErrors[name], submitFailed}
    const error = this.props.error || validationError(meta)

    let help = this.props.help
    if (_.isUndefined(help) && this.props.helpMd) {
      help = (<ReactMarkdown source={this.props.helpMd} {...this.props.markdownProps} />)
    }

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && <FormText color="muted">{help}</FormText>}
        {inline ? this.renderItemsInline() : this.renderItemColumns()}
        {help && !helpTop && <FormText color="muted">{help}</FormText>}
        {error && <FormFeedback>{error}</FormFeedback>}
      </FormGroup>
    )
  }
}
