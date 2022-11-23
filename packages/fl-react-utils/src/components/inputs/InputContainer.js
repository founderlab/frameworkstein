import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { FormGroup, Label, FormText, FormFeedback } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import { validationError, validationState } from '../../utils/validation'
import markdownProps from '../../utils/markdownProps'


export default function InputContainer(props) {
  const { children, className, label, meta, input, helpTop, check } = props

  const validation = props.validationState ? props.validationState(meta) : null
  const error = validationError(meta)

  let help = props.help
  if (_.isUndefined(help) && props.helpMd) {
    help = <ReactMarkdown source={props.helpMd} {...props.markdownProps} />
  }

  return (
    <FormGroup check={check} className={className}>
      {label && <Label>{label}</Label>}

      {helpTop && help && <div className={`small text-muted ${check ? 'ml-2' : 'mb-2'}`}>{help}</div>}

      {children({
        ...input,
        valid: validation === 'success',
        invalid: validation === 'error',
      })}

      {!helpTop && help && <div className={`small text-muted ${check ? 'ml-2' : 'mt-2'}`}>{help}</div>}

      {error && <FormFeedback>{error}</FormFeedback>}
    </FormGroup>
  )
}

InputContainer.propTypes = {
  className: PropTypes.string,
  input: PropTypes.object,
  label: PropTypes.node,
  meta: PropTypes.object,
  help: PropTypes.node,
  helpMd: PropTypes.string,
  helpTop: PropTypes.bool,
  validationState: PropTypes.func,
  markdownProps: PropTypes.object,
  children: PropTypes.node,
  check: PropTypes.bool,
}

InputContainer.defaultProps = {
  validationState,
  markdownProps,
  helpTop: true,
  inline: true,
  input: {},
}
