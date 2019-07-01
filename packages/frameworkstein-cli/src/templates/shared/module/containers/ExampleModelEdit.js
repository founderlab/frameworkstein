/* eslint-disable */

export default options =>
`import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { load${options.classPlural}, save${options.className}, delete${options.className}, update${options.className}, linkRelation, unlinkRelation } from '../actions'
import { select${options.className}, select${options.classPlural}Error } from '../selectors'
import ${options.className}Edit from '../components/${options.className}Edit'
import Loader from '../../utils/components/Loader'
${options.relations.map(relation => {
  if (relation.m2m) {
    return `import { load${relation.model.classPlural}, update${relation.model.className} } from '../../${relation.model.variablePlural}/actions'\n`
  }
  return `import { load${relation.model.classPlural} } from '../../${relation.model.variablePlural}/actions'\n`
}).join('')}

@connect((state, props) => ({
  ${options.variableName}: select${options.className}(state, props),
  errorMsg: select${options.classPlural}Error(state, 'save'),
  loading: state.${options.variablePlural}.get('loading'),${options.relations.map(relation => {
  if (relation.m2m) {
    return `\n  ${relation.model.variablePlural}Store: state.${relation.model.variablePlural},`
  }
  if (relation.relationType === 'belongsTo') {
    return `\n  ${relation.model.variablePlural}: _.values(state.${relation.model.variablePlural}.get('models').toJSON()),`
  }
  return `\n  ${relation.model.variablePlural}: _(state.${relation.model.variablePlural}.get('models').toJSON()).values().filter(m => m.${options.variableName}_id == props.match.params.id).value(),`
}).join('')}
}), {
  save${options.className},
  delete${options.className},
  push,
  linkRelation,
  unlinkRelation,${options.relations.map(relation => relation.m2m ? `\n  update${relation.model.className},` : '').join('')}
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
    unlinkRelation: PropTypes.func.isRequired,${options.relations.map(relation => relation.m2m ? `\n    update${relation.model.className}: PropTypes.func.isRequired,` : '').join('')}

    // Relations${options.relations.map(relation => {
  if (relation.m2m) {
    return `
    ${relation.model.variablePlural}: PropTypes.array.isRequired,`
  }
  return `
    ${relation.model.variablePlural}Store: PropTypes.object.isRequired,`
}).join('')}
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
      }${options.relations.map(relation => {
    if (relation.m2m) {
      return `

      // load m2m
      const ${relation.name}Action = await store.dispatch(load${relation.model.classPlural}({${options.variableName}_id: id}))
      // set related ids
      store.dispatch(update${options.className}({id, ${relation.model.variableName}_ids: ${relation.name}Action.ids}))`
    }
    if (relation.relationType === 'belongsTo') {
      return `

      // load all models for belongsTo selector
      await store.dispatch(load${relation.variablePlural}({}))`
    }
    return `

      // load related hasMany models
      await store.dispatch(load${relation.variablePlural}({${options.variableName}_id: id}))`
}).join('')}
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

          // Relations${options.relations.map(relation => {
    if (relation.m2m) {
      return `
          ${relation.model.variablePlural}={_(${options.variableName}.${relation.model.variableName}_ids).map(id => this.props.${relation.model.variablePlural}Store.get('models').get(id) && this.props.${relation.model.variablePlural}Store.get('models').get(id).toJSON()).compact().value()}`
    }
    return `
          ${relation.model.variablePlural}: this.props.${relation.model.variablePlural}`
}).join('')}
        />
      </div>
    )
  }
}
`


      // // orders belongsTo ${options.variableName} or m2m
      // const ordersAction = await store.dispatch(loadOrders({${options.variableName}_id: id}))

      // // // set related ids if m2m
      // // store.dispatch(update${options.className}({id, order_ids: ordersAction.ids}))

      // // orders belongsTo ${options.variableName} or m2m
      // const profileAction = await store.dispatch(loadProfiles({}))

      // // orders belongsTo ${options.variableName} or m2m
      // const manyModelsAction = await store.dispatch(loadManyModels({${options.variableName}_id: id}))
      // // set related ids if m2m
      // store.dispatch(update${options.className}({id, manyModel_ids: manyModelsAction.ids}))
