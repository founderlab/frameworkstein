

export default function createActions(modelAdmin) {
  const { Model } = modelAdmin

  return {
    loadModels: (query, callback) => {
      if (!query.$sort && modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        type: modelAdmin.actionType + '_LOAD',
        request: Model.cursor(query),
        callback,
      }
    },

    loadModelsPage: (page, query, callback) => {
      if (!query.$sort&& modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        page,
        type: modelAdmin.actionType + '_LOAD',
        request: Model.cursor(query),
        callback,
      }
    },

    countModels: (query, callback) => {
      return {
        type: modelAdmin.actionType + '_COUNT',
        request: callback => Model.count(query, callback),
        callback,
      }
    },

    saveModel: (data, callback) => {
      // const method = data.id ? 'put' : 'post'
      // const endpoint = data.id ? `${Model.prototype.urlRoot}/${data.id}` : Model.prototype.urlRoot
      const model = new Model(data)
      return {
        type: modelAdmin.actionType + '_SAVE',
        // request: request[method](endpoint).send(data),
        request: callback => model.save(callback),
        callback,
      }
    },

    deleteModel: (data, callback) => {
      return {
        type: modelAdmin.actionType + '_DELETE',
        request: callback => Model.destroy({id: data.id}, callback),
        deletedId: data.id,
        callback,
      }
    },

  }
}
