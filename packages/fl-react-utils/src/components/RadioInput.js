import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import { validationError } from '../validation'


export default class RadioInput extends React.PureComponent {

  static propTypes = {
    input: PropTypes.object,
    label: PropTypes.string,
    meta: PropTypes.object,
    help: PropTypes.string,
    inline: PropTypes.bool,
    options: PropTypes.array,
    helpTop: PropTypes.bool,

  }

  static defaultProps = {
    options: [],
    helpTop: true,
    inline: true,
  }

  constructor(props) {
    super(props)
    console.log('remade')
  }

  componentWillReceiveProps(props) {
    console.log('componentWillReceiveProps', props.input.value)
  }

  renderOption = (opt, labelProps={}) => {
    const { input, meta } = this.props

    const oc2 = e => {
      console.log('onchange', e.target.value)
      input.onChange(e.target.value)
    }
    return (
      <label key={opt.value} className="radio-inline" {...labelProps}>
        <input
          name={input.name}
          value={opt.value}
          type="radio"
          defaultChecked={meta.initial === opt.value}
          onChange={oc2}
        />
        {opt.label}
      </label>
    )
  }

  renderOptionColumn = opt => (
    <Col xs={6} key={opt.value} className="form-check form-check-inline mr-0">
      {this.renderOption(opt, {className: 'radio-inline px-2 py-2', style: {width: '100%'}})}
    </Col>
  )

  renderItems() {
    const { inline, options } = this.props
    if (inline) {
      return (
        <div>
          {options.map(this.renderOption)}
        </div>
      )
    }
    return (
      <Row className="mt-3">
        {options.map(this.renderOptionColumn)}
      </Row>
    )
  }

  render() {
    const { label, meta, help, helpTop } = this.props
    const error = validationError(meta)

    return (
      <FormGroup>
        {label && <Label>{label}</Label>}
        {help && helpTop && <FormText color="muted">{help}</FormText>}
        {this.renderItems()}
        {help && !helpTop && <FormText color="muted">{help}</FormText>}
        {error && <FormFeedback>{error}</FormFeedback>}
      </FormGroup>
    )
  }
}
