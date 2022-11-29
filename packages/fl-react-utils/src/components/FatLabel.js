import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { Label } from 'reactstrap'


export default function FatLabel(props) {
  const { input, icon, label, help, active } = props

  return (
    <Label check className={`radio-inline d-flex bg-light ${active ? 'active' : ''}`}>
      {input}
      <div className="ml-2">
        <div>{icon && <i className={`fad fa-fw fa-${icon} text-primary mr-2`} />}{label}</div>
        {help && <div className="small text-muted">{help}</div>}
      </div>
    </Label>
  )
}

FatLabel.propTypes = {
  active: PropTypes.bool,
  help: PropTypes.node,
  icon: PropTypes.string,
  input: PropTypes.node.isRequired,
  label: PropTypes.node,
}
