

export default options =>
`import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { load${options.classPlural} } from '../actions'
import { select${options.className} } from '../selectors'
import Loader from '../../../utils/components/Loader'
import ${options.classPlural}Detail from '../components/${options.classPlural}Detail'


@connect((state, props) => ({
  ${options.variableName}: select${options.className}(state, props),
  loading: state.${options.variableName}.get('loading'),
}), {})
export default class ${options.classPlural}DetailContainer extends React.PureComponent {

  static propTypes = {
    ${options.variableName}: PropTypes.object,
  }

  static async fetchData({store, match}) {
    try {
      let ${options.variableName} = select${options.className}(store.getState(), {match})

      if (!${options.variableName}) {
        const query = {
          id: match.params.${options.variableName}Id,
          $one: true,
        }

        const action = await store.dispatch(load${options.classPlural}(query))
        ${options.variableName} = action.model
      }

      if (!${options.variableName}) {
        console.log('No ${options.variableName} found for params:', match.params)
        return {status: 404}
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  render() {
    const { loading, ${options.variableName} } = this.props
    if (loading) return <Loader />

    return (
      <${options.classPlural}Detail
        ${options.variableName}={${options.variableName}}
      />
    )
  }
}
`
