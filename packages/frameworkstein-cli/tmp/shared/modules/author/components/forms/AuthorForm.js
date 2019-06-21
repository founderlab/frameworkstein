import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Input, HasManyInput, BelongsToInput, ManyToManyInput } from 'fl-react-utils'
import Button from '../../../utils/components/Button'
import Author from '../../../../models/Author'


@reduxForm({
  form: 'author',
})
export default class AuthorForm extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    author: PropTypes.object,

    // Relations
    orders: PropTypes.array,
    profiles: PropTypes.array,
    manyModels: PropTypes.array,
  }

  render() {
    const { loading, handleSubmit, author, manyModels } = this.props

    return (
      <form onSubmit={handleSubmit}>

        <Field
          name="firstName"
          label="First name"
          component={Input}
        />

        <Field
          name="lastName"
          label="Last name"
          component={Input}
        />

        <Field
          name="posts"
          label="Posts"
          component={Input}
        />


        <Field
          name="posts"
          label="Posts"
          path="/posts"
          models={posts}
          component={HasManyInput}
        />

        <div className="text-center mt-5">
          <Button loading={loading} type="submit" size="lg">Save</Button>
        </div>
      </form>
    )
  }
}
