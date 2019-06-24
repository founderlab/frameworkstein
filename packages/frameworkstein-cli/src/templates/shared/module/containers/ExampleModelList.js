
export default options =>
`import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { load${options.classPlural} } from '../actions'
import Loader from '../../utils/components/Loader'
import ${options.className}List from '../components/${options.className}List'


@connect(state => ({
  ${options.variablePlural}: state.${options.variablePlural}.get('modelList').toJSON(),
  loading: state.${options.variablePlural}.get('loading'),
}), {})
export default class ${options.className}ListContainer extends React.PureComponent {

  static propTypes = {
    ${options.variablePlural}: PropTypes.array.isRequired,
    loading: PropTypes.bool,
  }

  static async fetchData({store}) {
    try {
      await store.dispatch(load${options.classPlural}({}))
    }
    catch (err) {
      console.log(err)
    }
  }

  render() {
    const { loading, ${options.variablePlural} } = this.props
    if (loading) return <Loader />

    return (
      <${options.className}List
        ${options.variablePlural}={${options.variablePlural}}
      />
    )
  }
}
`
