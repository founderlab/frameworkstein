import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Inflection from 'inflection'
import {Field} from 'redux-form'
import {FormGroup, ControlLabel, HelpBlock} from 'react-bootstrap'
import {validationState} from '../validation'

export default class RadioField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    helpTop: PropTypes.bool,
    help: PropTypes.string,
    validationState: PropTypes.string,
    options: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]),
  }

  render() {
    const {name, label, help, validationState, helpTop} = this.props
    const id = Inflection.dasherize((label || '').toLowerCase())

    return (
      <FormGroup controlId={id} validationState={validationState}>
        {label && <ControlLabel>{label}</ControlLabel>}
        {help && helpTop && (<HelpBlock>{help}</HelpBlock>)}
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
        {help && !helpTop && (<HelpBlock>{help}</HelpBlock>)}
      </FormGroup>
    )
  }

}

