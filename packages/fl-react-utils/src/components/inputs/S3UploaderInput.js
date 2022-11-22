import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import S3Uploader from '../S3Uploader'
import InputContainer from './InputContainer'


export default function S3UploaderInput(props) {
  const { inputProps, type } = props

  return (
    <InputContainer {...props}>
      {innerProps => (
        <S3Uploader
          {...innerProps}
          {...inputProps}
          type={type}
        />
      )}
    </InputContainer>
  )
}

S3UploaderInput.propTypes = {
  inputProps: PropTypes.object,
  type: PropTypes.string,
}

S3UploaderInput.defaultProps = {
  inputProps: {},
}
