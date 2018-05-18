import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import { validationError, validationState } from 'fl-react-utils'


const getRte = () => {
  if (typeof window !== 'undefined') return require('react-rte').default
  return null
}

export default class MarkdownInput extends React.Component {

  static propTypes = {
    label: PropTypes.node,
    input: PropTypes.object,
    help: PropTypes.node,
    helpTop: PropTypes.bool,
    meta: PropTypes.object,
    validationState: PropTypes.func,
    inputProps: PropTypes.object,
    initialValue: PropTypes.string,
  }

  static defaultProps = {
    validationState,
    inputProps: {},
  }

  constructor(props) {
    super(props)
    this.state = {}
    const RichTextEditor = getRte()
    if (!RichTextEditor) return
    this.state.value = RichTextEditor.createValueFromString(props.input.value, 'markdown')
  }

  onChange = value => {
    this.setState({value})
    this.props.input.onChange((value.toString('markdown') || '').trim())
  }

  render() {
    const {label, input, meta, inputProps, help, helpTop} = this.props
    const error = validationError(meta)

    const RichTextEditor = getRte()
    const control = RichTextEditor ? (
      <RichTextEditor
        value={this.state.value}
        onChange={this.onChange}
        {...inputProps}
      />
    ) : null

    return (
      <FormGroup>
        {label && (<Label>{label}</Label>)}
        {help && helpTop && (<FormText color="muted">{help}</FormText>)}
        {control}
        {error && (<FormFeedback>{error}</FormFeedback>)}
        {help && !helpTop && (<FormText color="muted">{help}</FormText>)}
      </FormGroup>
    )
  }
}
