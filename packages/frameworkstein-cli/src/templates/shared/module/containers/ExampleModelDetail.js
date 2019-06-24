
export default options =>
`import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { load${options.classPlural} } from '../actions'
import { select${options.className} } from '../selectors'
import Loader from '../../utils/components/Loader'
import ${options.className}Detail from '../components/${options.className}Detail'


@connect((state, props) => ({
  loading: state.${options.variablePlural}.get('loading'),
  ${options.variableName}: select${options.className}(state, props),
}), {})
export default class ${options.classPlural}DetailContainer extends React.PureComponent {

  static propTypes = {
    loading: PropTypes.bool,
    ${options.variableName}: PropTypes.object,
  }

  static async fetchData({store, match}) {
    try {
      let ${options.variableName} = select${options.className}(store.getState(), {match})

      if (!${options.variableName}) {
        const query = {
          id: match.params.id,
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
    if (!${options.variableName}) return <Loader />

    return (
      <${options.className}Detail
        loading={loading}
        ${options.variableName}={${options.variableName}}
      />
    )
  }
}
`
