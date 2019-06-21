import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import { Input, HasManyInput, BelongsToInput, ManyToManyInput } from 'fl-react-utils'
import Button from '../../../utils/components/Button'
import Post from '../../../../models/Post'


@reduxForm({
  form: 'post',
})
export default class PostForm extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    post: PropTypes.object,

    // Relations
    orders: PropTypes.array,
    profiles: PropTypes.array,
    manyModels: PropTypes.array,
  }

  render() {
    const { loading, handleSubmit, post, manyModels } = this.props

    return (
      <form onSubmit={handleSubmit}>

        <Field
          name="title"
          label="Title"
          component={Input}
        />

        <Field
          name="author"
          label="Author"
          component={Input}
        />

        <Field
          name="votes"
          label="Votes"
          component={Input}
        />


        <Field
          name="author"
          label="Author"
          models={authors}
          component={BelongsToInput}
        />

        <div className="text-center mt-5">
          <Button loading={loading} type="submit" size="lg">Save</Button>
        </div>
      </form>
    )
  }
}
