
export default options =>
`import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { load${options.classPlural}, save${options.className}, delete${options.className}, update${options.className}, linkRelation, unlinkRelation } from '../actions'
import { loadOrders } from '../../orders/actions'
import { loadProfiles } from '../../profiles/actions'
import { loadManyModels, updateManyModel } from '../../manyModels/actions'
import { select${options.className}, select${options.classPlural}Error } from '../selectors'
import ${options.className}Edit from '../components/${options.className}Edit'
import Loader from '../../utils/components/Loader'


@connect((state, props) => ({
  ${options.variableName}: select${options.className}(state, props),
  errorMsg: select${options.classPlural}Error(state, 'save'),
  loading: state.${options.variablePlural}.get('loading'),
  orders: _(state.orders.get('models').toJSON()).values().filter(m => m.${options.variableName}_id == props.match.params.id).value(),
  profiles: _.values(state.profiles.get('models').toJSON()),
  manyModelsStore: state.manyModels,
}), {
  save${options.className},
  delete${options.className},
  push,
  linkRelation,
  unlinkRelation,
  updateManyModel,
})
export default class ${options.classPlural}EditContainer extends React.PureComponent {

  static propTypes = {
    ${options.variableName}: PropTypes.object,
    errorMsg: PropTypes.string,
    loading: PropTypes.bool,
    save${options.className}: PropTypes.func.isRequired,
    delete${options.className}: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,

    linkRelation: PropTypes.func.isRequired,
    unlinkRelation: PropTypes.func.isRequired,
    updateManyModel: PropTypes.func.isRequired,

    // Relations
    orders: PropTypes.array.isRequired,
    profiles: PropTypes.array.isRequired,
    manyModelsStore: PropTypes.object.isRequired,
  }

  static async fetchData({store, match}) {
    try {
      let ${options.variableName} = select${options.className}(store.getState(), {match})
      const id = match.params.id

      if (!${options.variableName}) {
        const action = await store.dispatch(load${options.classPlural}({id}))
        ${options.variableName} = action.model

        if (!${options.variableName}) {
          console.log('No ${options.variableName} found for params:', match.params)
          return {status: 404}
        }

      }
      // orders belongsTo ${options.variableName} or m2m
      const ordersAction = await store.dispatch(loadOrders({${options.variableName}_id: id}))

      // // set related ids if m2m
      // store.dispatch(update${options.className}({id, order_ids: ordersAction.ids}))

      // orders belongsTo ${options.variableName} or m2m
      const profileAction = await store.dispatch(loadProfiles({}))

      // orders belongsTo ${options.variableName} or m2m
      const manyModelsAction = await store.dispatch(loadManyModels({${options.variableName}_id: id}))
      // set related ids if m2m
      store.dispatch(update${options.className}({id, manyModel_ids: manyModelsAction.ids}))

    }
    catch (err) {
      console.log(err)
    }
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

  handleDelete = async data => {
    try {
      await this.props.delete${options.className}(data)
      this.props.push('/${options.variablePlural}')
    }
    catch (err) {
      return console.error(err)
    }
  }

  handleLinkRelation = (relatedModel, relationField, idsKey) => {
    this.props.updateManyModel(relatedModel)
    this.props.linkRelation(this.props.${options.variableName}, relationField, idsKey, relatedModel.id)
  }
  handleUnlinkRelation = (relatedModel, relationField, idsKey) => {
    this.props.unlinkRelation(this.props.${options.variableName}, relationField, idsKey, relatedModel.id)
  }

  render() {
    const { ${options.variableName}, loading, errorMsg } = this.props
    if (!${options.variableName}) return <Loader />

    return (
      <div>
        <Helmet title="Edit an ${options.className}" />
        <${options.className}Edit
          ${options.variableName}={${options.variableName}}
          loading={loading}
          errorMsg={errorMsg}
          onSubmit={this.handleSubmit}
          onDelete={this.handleDelete}
          onLinkRelation={this.handleLinkRelation}
          onUnlinkRelation={this.handleUnlinkRelation}

          // Relations
          orders={this.props.orders}
          profiles={this.props.profiles}
          manyModels={_(${options.variableName}.manyModel_ids).map(id => this.props.manyModelsStore.get('models').get(id) && this.props.manyModelsStore.get('models').get(id).toJSON()).compact().value()}
        />
      </div>
    )
  }
}
`
