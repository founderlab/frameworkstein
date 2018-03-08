import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import {Button, Glyphicon} from 'react-bootstrap'
import {Link} from 'react-router'
import {reduxForm, Field} from 'redux-form'
import {shouldEditFieldInline, shouldDisplayFieldInline} from '../../utils/inline'

export class ModelListForm extends React.Component {

  static propTypes = {
    model: PropTypes.object.isRequired,
    modelAdmin: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,

    // from redux-form
    handleSubmit: PropTypes.func.isRequired,
  }

  render() {
    const {modelAdmin, model, handleSubmit, onDelete} = this.props
    const showSave = _.some(modelAdmin.fields, f => shouldEditFieldInline(f))

    return (
      <tr>
        <td className="fla-name-td">
          <Link to={modelAdmin.link(model)}>
            {modelAdmin.display(model)}
            <Glyphicon glyph="pencil" />
          </Link>
        </td>

        {_.map(modelAdmin.fields, (modelField, key) => {
          if (shouldEditFieldInline(modelField)) {
            const fieldName = modelField.virtual_id_accessor || modelField.key || key
            return (
              <td key={key} className="fla-list-edit-td">
                <Field
                  name={fieldName}
                  model={model}
                  modelField={modelField}
                  component={modelField.InputComponent}
                />
              </td>
            )
          }
          else if (shouldDisplayFieldInline(modelField)) {
            const value = model[modelField.virtual_id_accessor || modelField.key || key]
            let displayValue = value
            if (modelField.display) displayValue = modelField.display(value)
            else if (modelField.type === 'Boolean') displayValue = value ? (<Glyphicon glyph="ok" />) : (<Glyphicon glyph="times" />)
            return (
              <td key={key} className="fla-list-display-td">
                {displayValue}
              </td>
            )
          }
          return null
        })}

        {showSave ? (
          <td className="fla-save-td">
            <Button bsStyle="primary" onClick={handleSubmit}><Glyphicon glyph="ok" /></Button>
          </td>
        ) : null}
        {modelAdmin.listDelete && (
          <td className="fla-delete-td">
            <Button bsStyle="danger" bsSize="xsmall" onClick={onDelete}><Glyphicon glyph="remove" /></Button>
          </td>
        )}
      </tr>
    )
  }
}

export default function createModelListForm(model) {
  return reduxForm(
    {
      form: `model_list_row_${model.id}`,
      initialValues: model,
    },
  )(ModelListForm)
}
