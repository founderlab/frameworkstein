import _ from 'lodash' // eslint-disable-line
import qs from 'qs'
import moment from 'moment'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { createPaginationSelector } from 'fl-redux-utils'
import Loader from '../../components/Loader'
import ModelList from '../../containers/ModelList'
import ModelDetail from '../../containers/ModelDetail'
import fetchRelated from '../../utils/fetchRelated'


export default function createModelEditor(modelAdmin) {
  const { loadModels, loadModelsPage, countModels, saveModel, deleteModel } = modelAdmin.actions

  return @connect(
    createPaginationSelector(
      state => state.admin[modelAdmin.path],
      state => ({
        modelStore: state.admin[modelAdmin.path],
      }),
    ),
    {loadModels, saveModel, deleteModel},
  )
  class ModelEditor extends Component {

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

    static async fetchData({store, match}) {
      const {auth} = store.getState()
      const modelId = match.params.id
      const urlQuery = qs.parse(match.url)
      const query = _.extend(modelAdmin.query || {}, {$user_id: auth.get('user').get('id')})

      if (modelId) {
        query.id = modelId
        await store.dispatch(loadModels(query))
      }
      else {
        query.$limit = modelAdmin.perPage
        const page = +urlQuery.page || 1
        if (page > 1) query.$offset = modelAdmin.perPage * (page-1)

        await store.dispatch(countModels(query))
        await store.dispatch(loadModelsPage(page, query))
      }

      const modelStore = store.getState().admin[modelAdmin.path]
      const modelIds = modelId ? [modelId] : modelStore.get('pagination').get('visible').toJSON()
      await fetchRelated({store, modelAdmin, modelIds, loadAll: !!modelId})
    }

    hasData() {
      return !this.props.modelStore.get('loading')
    }

    // handleAdd = () => this.props.save({})
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

      const componentProps = {
        id,
        modelAdmin,
        modelStore,
        location,
        visibleItems,
        totalItems,
        currentPage,
        // onAdd: this.handleAdd,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
      }

      if (id) return (<ModelDetail {...componentProps} />)
      return (<ModelList {...componentProps} />)
    }
  }

}
