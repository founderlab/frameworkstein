import _ from 'lodash' // eslint-disable-line
import {connect} from 'react-redux'
import React, {Component, PropTypes} from 'react'
import {push} from 'redux-router'
import ModelDetail from '../../containers/ModelDetail'

export default function createModelCreate(modelAdmin) {
  const {save, del} = modelAdmin.actions

  return @connect(
    state => ({
      modelStore: state.admin[modelAdmin.path],
      config: state.config,
    }),
    {save, del, push}
  )
  class ModelEditor extends Component {

    static propTypes = {
      modelStore: PropTypes.object.isRequired,
      save: PropTypes.func,
      del: PropTypes.func,
    }

    handleSaveFn = () => data => {
      this.props.save(data, (err) => {
        if (err) return console.log(err)
        const model = this.props.modelStore.get('lastSaved').toJSON()
        this.props.push(modelAdmin.link(model.id))
      })
    }

    // todo: make delete undoable
    handleDeleteFn = model => () => {
      if (window.confirm(`Are you really, really sure you want to delete this model? You can't have it back.`)) {
        this.props.del(model, err => err && console.log(err))
        if (this.props.id) push(modelAdmin.link())
      }
    }

    render() {
      const {modelStore} = this.props
      const config = this.props.config.toJSON()

      const componentProps = {
        modelAdmin,
        modelStore,
        config,
        handleSaveFn: this.handleSaveFn,
        handleDeleteFn: this.handleDeleteFn,
      }

      return (
        <ModelDetail {...componentProps} />
      )
    }
  }
}
