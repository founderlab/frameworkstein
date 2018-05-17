import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Inflection from 'inflection'
import { Field} from 'redux-form'
import { FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import { validationError, validationState } from '../validation'


export default class RadioField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    helpTop: PropTypes.bool,
    help: PropTypes.string,
    error: PropTypes.string,
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
  }

  render() {
    const {name, label, help, error, helpTop} = this.props

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        <div>
          {this.props.options.map((opt, i) => (
            <label key={i} className="radio-inline">
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
