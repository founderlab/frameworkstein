import _ from 'lodash' // eslint-disable-line
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'
import Loader from '../../components/Loader'
import BelongsTo from '../../components/inputs/BelongsTo'
import ManyToMany from '../../components/inputs/ManyToMany'
import HasMany from '../../components/inputs/HasMany'
import InlineRelation from '../../components/inputs/InlineRelation'


export default function createRelatedField(relationField) {
  const { modelAdmin } = relationField
  if (!modelAdmin) return null
  const { loadModels, saveModel, deleteModel } = modelAdmin.actions

  return @connect(state => ({modelStore: state.admin[modelAdmin.path]}), {loadModels, saveModel, deleteModel})
  class RelatedInput extends Component {

    static propTypes = {
      model: PropTypes.object,
      modelStore: PropTypes.object,
      formField: PropTypes.object,
      loadModels: PropTypes.func,
      saveModel: PropTypes.func,
      deleteModel: PropTypes.func,
    }

    hasData() {
      return this.props.modelStore && !this.props.modelStore.get('loading')
    }

    hasManyRelationAttrs = () => ({[relationField.relation.foreignKey]: this.props.model.id})

    handleAdd = () => {
      this.props.saveModel(this.hasManyRelationAttrs())
    }
    handleSaveFn = model => data => this.props.saveModel(_.extend(this.hasManyRelationAttrs(), model, data))
    handleDeleteFn = model => () => this.props.deleteModel(model)

    render() {
      if (!this.hasData()) return <Loader type="inline" />
      const { model, modelStore } = this.props
      const props = {relationField, ...this.props}

      if (!relationField.relation.reverseRelation) {
        console.log('Missing reverse relation', relationField.key, 'for model', relationField.relation.modelType.name, relationField)
        return null
      }

      if (relationField.type === 'belongsTo') {
        if (relationField.inline) console.log('[fl-admin] inline editing belongsTo relations is not yet supported')
        return <BelongsTo {...props} />
      }
      if (relationField.type === 'hasMany' && relationField.relation.reverseRelation.type === 'hasMany') {
        return (
          <ManyToMany
            relationField={relationField}
            {...this.props}
          />
        )
      }

      if (relationField.type === 'hasMany' || relationField.type === 'hasOne') {
        props.models = _(modelStore.get('models').toJSON()).values().filter(relatedModel => relatedModel[relationField.relation.foreignKey] === model.id).value()

        //TODO: This should be made to work for belongsTo / manyToMany
        if (relationField.inline) {
          return (
            <InlineRelation
              onAdd={this.handleAdd}
              handleSaveFn={this.handleSaveFn}
              handleDeleteFn={this.handleDeleteFn}
              {...props}
            />
          )
        }

        return <HasMany {...props} />
      }

      warning(false, `[fl-admin] Relation does not have a known type: ${relationField.type}. Note that manyToMany is not yet supported`)
      return null
    }
  }
}
