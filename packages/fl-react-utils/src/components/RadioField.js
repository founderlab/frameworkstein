import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Field} from 'redux-form'
import { FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
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
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
  }

  static defaultProps = {
    formMeta: {},
    formSyncErrors: {},
    submitFailed: false,
  }

  render() {
    const { name, label, help, formMeta, formSyncErrors, submitFailed, helpTop } = this.props
    const meta = {...formMeta[name] || {}, error: formSyncErrors[name], submitFailed}
    const error = this.props.error || validationError(meta)

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        <div>
          {this.props.options.map(opt => (
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
        {error && (<FormFeedback>{error}</FormFeedback>)}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
