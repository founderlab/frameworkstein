import Inflection from 'inflection'

export function label(key) {
  return Inflection.humanize(Inflection.underscore(key))
}

export default model =>
`import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Input, HasManyInput, BelongsToInput, ManyToManyInput } from 'fl-react-utils'
import Button from '../../../utils/components/Button'
import ${model.className} from '../../../../models/${model.className}'


@reduxForm({
  form: '${model.variableName}Form',
})
export default class ${model.className}Form extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    ${model.variableName}: PropTypes.object,

    // Relations
    ${model.relations.map(relation => `${relation.model.variablePlural}: PropTypes.array,`).join('\n')}
  }

  render() {
    const { loading, handleSubmit, ${model.variableName}, ${model.relations.map(relation => relation.model.variablePlural).join(', ')} } = this.props

    return (
      <form onSubmit={handleSubmit}>
${model.fields.map(field => `
        <Field
          name="${field.name}"
          label="${label(field.name)}"
          component={Input}
        />
`).join('')}
${model.relations.map(relation => {
    if (relation.m2m) {
      return `
        <Field
          {...this.props}
          name="${relation.name}"
          label="${label(relation.name)}"
          path="/${relation.model.variablePlural}"
          model={${model.variableName}}
          models={${relation.model.variablePlural}}
          component={ManyToManyInput}
          relation={${model.className}.schema.relations.${relation.name}}
        />`
    }
    if (relation.relationType === 'hasMany') {
      return `
        <Field
          name="${relation.name}"
          label="${label(relation.name)}"
          path="/${relation.model.variablePlural}"
          models={${relation.model.variablePlural}}
          component={HasManyInput}
        />`
    }
    if (relation.relationType === 'belongsTo') {
      return `
        <Field
          name="${relation.name}"
          label="${label(relation.name)}"
          models={${relation.model.variablePlural}}
          component={BelongsToInput}
        />`
    }
    return ''
}).join('')}

        <div className="text-center mt-5">
          <Button loading={loading} type="submit" size="lg">Save</Button>
        </div>
      </form>
    )
  }
}
`
