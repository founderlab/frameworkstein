import renderFormFields from './renderFormFields'

export default options =>
`import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import Inflection from 'inflection'
import { reduxForm, Field } from 'redux-form'
import { Input, HasManyInput, BelongsToInput, ManyToManyInput } from 'fl-react-utils'
import Button from '../../../utils/components/Button'
import ${options.className} from '../../../../models/${options.className}'


export function label(key) {
  return Inflection.humanize(Inflection.underscore(key))
}

@reduxForm({
  form: '${options.variableName}',
})
export default class ${options.className}Form extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    ${options.variableName}: PropTypes.object,

    // Relations
    orders: PropTypes.array,
    profiles: PropTypes.array,
    manyModels: PropTypes.array,
  }

  render() {
    const { loading, handleSubmit, ${options.variableName}, orders, profiles, manyModels } = this.props

    return (
      <form onSubmit={handleSubmit}>

        ${renderFormFields(options)}

        <Field
          name="orders"
          label="Orders"
          path="/orders"
          models={orders}
          component={HasManyInput}
        />

        <Field
          name="profile_id"
          label="Profile"
          models={profiles}
          component={BelongsToInput}
        />

        <Field
          {...this.props}
          name="manyModels"
          label="Many Models"
          path="/manyModels"
          model={${options.variableName}}
          models={manyModels}
          component={ManyToManyInput}
          relation={${options.className}.schema.relations.manyModels}
        />

        <div className="text-center mt-5">
          <Button loading={loading} type="submit" size="lg">Save</Button>
        </div>
      </form>
    )
  }
}
`
