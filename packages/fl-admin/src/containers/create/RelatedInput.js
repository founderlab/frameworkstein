import _ from 'lodash' // eslint-disable-line
import {connect} from 'react-redux'
import React, {Component, PropTypes} from 'react'
import warning from 'warning'
import Loader from '../../components/Loader'
import BelongsTo from '../../components/inputs/BelongsTo'
import ManyToMany from '../../components/inputs/ManyToMany'
import HasMany from '../../components/inputs/HasMany'
import InlineRelation from '../../components/inputs/InlineRelation'

export default function createRelatedField(relationField) {
  const {modelAdmin} = relationField
  if (!modelAdmin) return null
  const {load, save, del} = modelAdmin.actions

  return @connect(state => ({modelStore: state.admin[modelAdmin.path], config: state.config}), {load, save, del})
  class RelatedInput extends Component {

    static propTypes = {
      model: PropTypes.object,
      modelStore: PropTypes.object,
      formField: PropTypes.object,
      load: PropTypes.func,
    }

    hasData() {
      return this.props.modelStore && !this.props.modelStore.get('loading')
    }

    hasManyRelationAttrs = () => ({[relationField.relation.foreignKey]: this.props.model.id})

    handleAdd = () => {
      this.props.save(this.hasManyRelationAttrs())
    }
    handleSaveFn = model => data => this.props.save(_.extend(this.hasManyRelationAttrs(), model, data))
    handleDeleteFn = model => () => this.props.del(model)

    render() {
      if (!this.hasData()) return (<Loader type="inline" />)
      const {model, modelStore} = this.props
      const props = {relationField, ...this.props}

      if (relationField.type === 'belongsTo') {
        if (relationField.inline) console.log('[fl-admin] inline editing belongsTo relations is not yet supported')
        return (<BelongsTo {...props} />)
      }

      if (relationField.type === 'hasMany' && relationField.relation.reverse_relation.type === 'hasMany') {
        return (
          <ManyToMany
            relationField={relationField}
            {...this.props}
          />
        )
      }

      if (relationField.type === 'hasMany' || relationField.type === 'hasOne') {
        props.models = _(modelStore.get('models').toJSON()).values().filter(relatedModel => relatedModel[relationField.relation.foreign_key] === model.id).value()

        //TODO: This should be made to work for belongsTo / manyToMany
        if (relationField.inline) {
          return (
            <InlineRelation
              config={this.props.config.toJSON()}
              onAdd={this.handleAdd}
              handleSaveFn={this.handleSaveFn}
              handleDeleteFn={this.handleDeleteFn}
              {...props}
            />
          )
        }

        return (<HasMany {...props} />)
      }

      warning(false, `[fl-admin] Relation does not have a known type: ${relationField.type}. Note that manyToMany is not yet supported`)
      return null
    }
  }
}
