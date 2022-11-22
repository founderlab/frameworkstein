import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FormGroup, Label } from 'reactstrap'


const display = model => model ? (model.name || model.title || model.id) : 'null'

export default function HasManyInput(props) {
  const { path, models, label } = props

  return (
    <FormGroup>
      {label ? (<Label>{label}</Label>) : null}
      <div className="list-group">
        {_.map(models, relatedModel => (
          <Link to={`${path}/${relatedModel.id}`} className="list-group-item" key={relatedModel.id} target="_blank">
            {display(relatedModel)}
            <br />
          </Link>
        ))}
      </div>
    </FormGroup>
  )
}

HasManyInput.propTypes = {
  path: PropTypes.string.isRequired,
  models: PropTypes.array.isRequired,
  label: PropTypes.node.isRequired,
}
