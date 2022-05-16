import _ from 'lodash' // eslint-disable-line
import qs from 'qs'
import moment from 'moment'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { createPaginationSelector } from 'fl-redux-utils'
import ModelList from '../../components/ModelList'
import fetchRelated from '../../utils/fetchRelated'


function parseFilterQuery(filters) {
  if (!filters) return {}
  let filterQuery = {}
  try {
    filterQuery = JSON.parse(filters)
  }
  catch (err) {
    console.log('[ModelListEditor] error parsing filter query', err)
  }
  return filterQuery
}

export default function createModelListEditor(modelAdmin) {
  const { loadModels, loadModelsPage, countModels, saveModel, deleteModel } = modelAdmin.actions

  return @connect(
    createPaginationSelector(
      state => state.admin[modelAdmin.path],
      state => ({
        modelStore: state.admin[modelAdmin.path],
      }),
    ),
    { loadModels, saveModel, deleteModel },
  )
  class ModelListEditor extends Component {

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

    static async fetchData({ store, location }) {
      const { auth } = store.getState()
      const urlQuery = qs.parse(location.search, {ignoreQueryPrefix: true})
      const query = _.extend({}, modelAdmin.query || {}, parseFilterQuery(urlQuery.filters), {$user_id: auth.get('user').get('id')})

      if (urlQuery.search && modelAdmin.searchFields && modelAdmin.searchFields.length) {
        const $search = urlQuery.search.trim()
        query.$or = _.map(modelAdmin.searchFields, f => ({[f]: {$search}}))
      }
      await store.dispatch(countModels(_.clone(query)))

      query.$limit = modelAdmin.perPage
      const page = +urlQuery.page || 1
      if (page > 1) query.$offset = modelAdmin.perPage * (page-1)

      const loadedAction = await store.dispatch(loadModelsPage(page, _.clone(query)))
      const modelIds = loadedAction.ids
      await fetchRelated({store, modelAdmin, modelIds})
    }

    query = () => qs.parse(this.props.location.search, {ignoreQueryPrefix: true})

    handleSearch = searchString => {
      const { location, history } = this.props
      const query = this.query()
      if (searchString) {
        query.search = searchString.trim()
      }
      else {
        delete query.search
      }
      history.push(`${location.pathname}?${qs.stringify(query)}`)
    }

    handleFilter = filterQuery => {
      const { location, history } = this.props
      const query = _.extend({}, this.query(), {filters: JSON.stringify(filterQuery)})
      history.push(`${location.pathname}?${qs.stringify(query)}`)
    }

    handleReset = () => {
      const { location, history } = this.props
      history.push(location.pathname)
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
        loading: modelStore.get('loading'),
        searchString: this.query().search,
        // onAdd: this.handleAdd,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
        onSearch: this.handleSearch,
        onFilter: this.handleFilter,
      }

      return (
        <ModelList {...componentProps} />
      )
    }
  }

}
