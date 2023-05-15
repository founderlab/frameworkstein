import React from 'react'
import PropTypes from 'prop-types'
import TextInput from './TextInput'


export default function IconInput(props) {
  return (
    <TextInput
      {...props}
      prepend={<i className={`fal fa-${props.input.value}`} aria-hidden="true" />}
    />
  )
}

IconInput.propTypes = {
  input: PropTypes.object.isRequired,
  help: PropTypes.node,
}

IconInput.defaultProps = {
  help: (
    <div>
      Search <a href="https://fontawesome.com/cheatsheet/pro/light" className="text-link" target="_blank" rel="noopener noreferrer">Font Awesome</a> for an icon and enter its name here:
    </div>
  ),
}
