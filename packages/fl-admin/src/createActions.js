import _ from 'lodash' // eslint-disable-line
import request from 'superagent'

export default function createActions(modelAdmin) {
  const actionType = name => `${modelAdmin.actionType}_${name.toUpperCase()}`
  const {Model} = modelAdmin

  return {
    loadModels: (query, callback) => {
      if (!query.$sort && modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        type: actionType('load'),
        request: Model.cursor(query),
        callback,
      }
    },

    countModels: (query, callback) => {
      return {
        type: actionType('count'),
        request: callback => Model.count(query, callback),
        callback,
      }
    },

    loadModelsPage: (page, query, callback) => {
      if (!query.$sort&& modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        page,
        type: actionType('load'),
        request: Model.cursor(query),
        callback,
      }
    },

    saveModel: (data, callback) => {
      const method = data.id ? 'put' : 'post'
      const endpoint = data.id ? `${Model.prototype.urlRoot}/${data.id}` : Model.prototype.urlRoot
      return {
        type: actionType('save'),
        request: request[method](endpoint).send(data),
        callback,
      }
    },

    delModel: (data, callback) => {
      return {
        type: actionType('del'),
        request: callback => Model.destroy({id: data.id}, callback),
        deletedId: data.id,
        callback,
      }
    },

  }
}
