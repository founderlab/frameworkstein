/* eslint-env browser */
import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { createPaginationSelector } from 'fl-redux-utils'
import Loader from '../../components/Loader'
import ModelDetail from '../../components/ModelDetail'
import fetchRelated from '../../utils/fetchRelated'


export default function createModelDetailEditor(modelAdmin) {
  const { loadModels, saveModel, deleteModel } = modelAdmin.actions
  const paginationSelector = createPaginationSelector(state => state.admin[modelAdmin.path])

  class ModelDetailEditor extends Component {

    static propTypes = {
      modelStore: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      match: PropTypes.object.isRequired,
      loadModels: PropTypes.func,
      saveModel: PropTypes.func,
      deleteModel: PropTypes.func,
      visibleItems: PropTypes.array,
      totalItems: PropTypes.number,
      currentPage: PropTypes.number,
    }

    static async fetchData({ store, match }) {
      try {
        const { auth } = store.getState()
        const modelId = match.params.id
        const query = _.extend({}, modelAdmin.query || {}, { $user_id: auth.get('user').get('id') })

        if (modelId) {
          query.id = modelId
          await store.dispatch(loadModels(query))
          await fetchRelated({ store, modelAdmin, modelIds: [modelId], loadAll: true })
        }
      }
      catch (err) {
        console.log(err)
      }
    }

    hasData() {
      return !this.props.modelStore.get('loading')
    }

    handleSaveFn = model => data => {
      this.props.saveModel(_.extend(model, data))
    }

    // todo: make delete undoable
    handleDeleteFn = model => () => {
      if (window.confirm('Are you really, really sure you want to delete this model? You can\'t have it back.')) {
        this.props.deleteModel(model, err => err && console.log(err))
        if (this.props.match.params.id) this.props.history.push(modelAdmin.link())
      }
    }

    render() {
      if (!this.hasData()) return (<Loader />)
      const { visibleItems, totalItems, currentPage, modelStore, match, location } = this.props
      const id = match.params.id

      // Format dates for form initial values
      _.forEach(visibleItems, model => {
        _.forEach(modelAdmin.fields, (f, key) => {
          const type = f.type && f.type.toLowerCase()
          if (!type) return
          if (type === 'datetime' && model[key]) {
            model[key] = moment(new Date(model[key])).format('L LT')
          }
          else if (type === 'date' && model[key]) {
            model[key] = moment(new Date(model[key])).format('L')
          }
        })
      })

      const modelIm = modelStore.get('models').get(id)
      const model = modelIm ? modelIm.toJSON() : {}
      const componentProps = {
        id,
        modelAdmin,
        model,
        location,
        visibleItems,
        totalItems,
        currentPage,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
      }

      return (
        <ModelDetail {...componentProps} />
      )
    }
  }

  return connect(
    (state, props) => ({
      ...paginationSelector(state, props),
      modelStore: state.admin[modelAdmin.path],
    }),
    { loadModels, saveModel, deleteModel },
  )(ModelDetailEditor)

}
