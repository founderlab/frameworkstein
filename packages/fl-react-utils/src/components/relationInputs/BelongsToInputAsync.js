import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Async } from 'react-select'


const display = model => model ? (model.name || model.title || model.id) : 'null'

const createOption = relatedModel => ({
  relatedModel,
  value: relatedModel.id,
  label: display(relatedModel),
})

export default class BelongsToInputAsync extends React.PureComponent {
  static propTypes = {
    label: PropTypes.node.isRequired,
    RelatedModel: PropTypes.func.isRequired,
    input: PropTypes.object.isRequired,
    model: PropTypes.object,
  }

  loadOptions = (input, callback) => {
    const { RelatedModel } = this.props
    if (!input.length) return callback(null, {options: [], complete: false})

    const query = {
      $or: [{id: input}, {name: {$search: input}}],
    }

    RelatedModel.cursor(query).toJSON((err, relatedModels) => {
      if (err) return console.log(err)

      const options = _.map(relatedModels, createOption)
      callback(null, {options, complete: true})
    })
  }

  render() {
    const { label, model, input } = this.props

    return (
      <div className="m2m form-group">
        <label>{label}</label>
        <Async
          placeholder="Select.."
          loadOptions={this.loadOptions}
          onBlurResetsInput={false}
          onCloseResetsInput={false}
          autoload={false}
          defaultOptions={model ? [createOption(model)] : []}
          {...input}
        />
      </div>
    )
  }
}
