import _ from 'lodash' // eslint-disable-line
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ModelDetail from '../../components/ModelDetail'


export default function createModelCreate(modelAdmin) {
  const { saveModel, deleteModel } = modelAdmin.actions

  return @connect(
    state => ({
      modelStore: state.admin[modelAdmin.path],
    }),
    {saveModel, deleteModel},
  )
  class ModelCreate extends Component {

    static propTypes = {
      modelStore: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,
      saveModel: PropTypes.func,
      deleteModel: PropTypes.func,
      id: PropTypes.string,
    }

    handleSaveFn = () => async data => {
      const action = await this.props.saveModel(data)
      this.props.history.push(modelAdmin.link(action.model.id))
    }

    // todo: make delete undoable
    handleDeleteFn = model => () => {
      if (window.confirm(`Are you really, really sure you want to delete this model? You can't have it back.`)) {
        this.props.deleteModel(model, err => err && console.log(err))
        if (this.props.id) this.props.history.push(modelAdmin.link())
      }
    }

    render() {
      const { modelStore } = this.props

      const componentProps = {
        modelAdmin,
        modelStore,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
      }

      return (
        <ModelDetail {...componentProps} />
      )
    }
  }
}
