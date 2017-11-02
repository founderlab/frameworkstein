import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Queue from 'queue-async'
import {connect} from 'react-redux'
import React, {Component, PropTypes} from 'react'
import {push} from 'redux-router'
// import {createPaginationSelector} from 'fl-redux-utils'
import Loader from '../../components/Loader'
import ModelList from '../../containers/ModelList'
import ModelDetail from '../../containers/ModelDetail'
import fetchRelated from '../../utils/fetchRelated'

export default function createModelEditor(modelAdmin) {
  const {load, loadPage, count, save, del} = modelAdmin.actions

  return @connect(
    // createPaginationSelector(
    //   state => state.admin[modelAdmin.path],
    //   state => ({
    //     modelStore: state.admin[modelAdmin.path],
    //     id: state.router.params.id,
    //     config: state.config,
    //   })
    // ),
    state => ({
      modelStore: state.admin[modelAdmin.path],
      id: state.router.params.id,
      config: state.config,
    }),
    {load, save, del, push}
  )
  class ModelEditor extends Component {

    static propTypes = {
      modelStore: PropTypes.object.isRequired,
      id: PropTypes.string,
      load: PropTypes.func,
      save: PropTypes.func,
      del: PropTypes.func,
    }

    static fetchData({store, action}, callback) {
      const {auth, router} = store.getState()

      // lookup the location from the incoming action here if one exists
      // if the ?page=xxx query was changed by redux-router the state won't have updated yet
      const location = (action && action.payload && action.payload.location ? action.payload.location : router.location)
      const modelId = ((action && action.payload && action.payload.params) || router.params).id
      const query = _.extend(modelAdmin.query || {}, {$user_id: auth.get('user').get('id')})
      const queue = new Queue()

      if (modelId) {
        queue.defer(callback => {
          query.id = modelId
          store.dispatch(load(query, callback))
        })
      }
      else {
        queue.defer(callback => store.dispatch(count(query, callback)))
        queue.defer(callback => {
          query.$limit = modelAdmin.perPage

          const page = +location.query.page || 1

          if (page > 1) query.$offset = modelAdmin.perPage * (page-1)
          return store.dispatch(loadPage(page, query, callback))
        })
      }

      queue.await(err => {
        if (err) return console.error(err)
        const modelStore = store.getState().admin[modelAdmin.path]
        const modelIds = modelId ? [modelId] : modelStore.get('pagination').get('visible').toJSON()
        fetchRelated({store, modelAdmin, modelIds, loadAll: !!modelId}, callback)
      })
    }

    hasData() {
      return !this.props.modelStore.get('loading')
    }

    // handleAdd = () => this.props.save({})
    handleSaveFn = model => data => {
      this.props.save(_.extend(model, data))
    }

    // todo: make delete undoable
    handleDeleteFn = model => () => {
      if (window.confirm('Are you really, really sure you want to delete this model? You can\'t have it back.')) {
        this.props.del(model, err => err && console.log(err))
        if (this.props.id) push(modelAdmin.link())
      }
    }

    render() {
      if (!this.hasData()) return (<Loader />)
      const {id, modelStore, location} = this.props
      const config = this.props.config.toJSON()

      const currentPage = +(location.query.page || 1)
      const itemsPerPage = +(location.query.perPage || modelAdmin.perPage)

      // TODO: These should come from the pagination selector via createPaginationSelector,
      // but it's causing an infinite loop for whatever reason
      const pagination = modelStore.get('pagination')
      const visibleIds = pagination.get('visible').toJSON()
      const totalItems = +(pagination.get('total'))
      const visibleItems = []

      _.forEach(visibleIds, id => modelStore.get('models').get(id) && visibleItems.push(modelStore.get('models').get(id).toJSON()))

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
        config,
        visibleItems,
        totalItems,
        location,
        currentPage,
        itemsPerPage,
        // onAdd: this.handleAdd,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
      }

      if (id) return (<ModelDetail {...componentProps} />)
      return (<ModelList {...componentProps} />)
    }
  }

}
