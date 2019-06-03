
export default options =>
`import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { save${options.className} } from '../actions'
import { select${options.classPlural}Error } from '../selectors'
import ${options.className}Create from '../components/${options.className}Create'


@connect(state => ({
  loading: state.${options.variablePlural}.get('loading'),
  errorMsg: select${options.classPlural}Error(state, 'save'),
}), { save${options.className}, push })
export default class ${options.classPlural}CreateContainer extends React.PureComponent {

  static propTypes = {
    errorMsg: PropTypes.string,
    loading: PropTypes.bool,
    push: PropTypes.func.isRequired,
    save${options.className}: PropTypes.func.isRequired,
  }

  handleSubmit = async data => {
    try {
      const action = await this.props.save${options.className}(data)
      const ${options.variableName} = action.model
      if (${options.variableName}.id) this.props.push(\`/${options.variablePlural}/$\{${options.variableName}.id}\`)
    }
    catch (err) {
      return console.error(err)
    }
  }

  render() {
    const { loading, errorMsg } = this.props

    return (
      <div>
        <Helmet title="Create an ${options.className}" />
        <${options.className}Create
          loading={loading}
          errorMsg={errorMsg}
          onSubmit={this.handleSubmit}
        />
      </div>
    )
  }
}
`
