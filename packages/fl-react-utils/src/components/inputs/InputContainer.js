import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormGroup, Label, FormFeedback } from 'reactstrap'
import ReactMarkdown from 'react-markdown'
import { validationError, validationState } from '../../utils/validation'
import markdownProps from '../../utils/markdownProps'


export default function InputContainer(props) {
  const { children, className, label, meta, input, placeholder, helpTop, check } = props
  const [wasValidating, setWasValidating] = React.useState(false)
  const validation = props.validationState ? props.validationState(meta) : null
  const error = validationError(meta) || (wasValidating && meta.invalid && meta.error)

  let help = props.help
  if (_.isUndefined(help) && props.helpMd) {
    help = <ReactMarkdown source={props.helpMd} {...props.markdownProps} />
  }

  React.useEffect(() => {
    if (meta.validating && !wasValidating) setWasValidating(true)
  }, [meta.validating])

  return (
    <FormGroup check={check} className={classNames(className, { 'mb-4': !check })}>
      {label && <Label>{label}</Label>}

      {helpTop && help && <div className={`small text-muted ${check ? 'ms-2' : 'mb-2'}`}>{help}</div>}

      {children({
        ...input,
        placeholder,
        valid: validation === 'success' || (wasValidating && meta.valid),
        invalid: validation === 'error' || (wasValidating && meta.invalid),
        validating: meta.validating ? meta.validating : undefined,
      })}

      {!helpTop && help && <div className={`small text-muted ${check ? 'ms-2' : 'mt-2'}`}>{help}</div>}

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
  children: PropTypes.func,
  check: PropTypes.bool,
  placeholder: PropTypes.string,
}

InputContainer.defaultProps = {
  validationState,
  markdownProps,
  helpTop: true,
  input: {},
}
