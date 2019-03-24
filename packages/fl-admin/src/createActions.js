

export default function createActions(modelAdmin) {
  const { Model } = modelAdmin

  return {
    loadModels: query => {
      if (!query.$sort && modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        type: modelAdmin.actionType + '_LOAD',
        request: Model.cursor(query),
      }
    },

    loadModelsPage: (page, query) => {
      if (!query.$sort && modelAdmin.sort) query.$sort = modelAdmin.sort
      return {
        page,
        type: modelAdmin.actionType + '_LOAD',
        request: Model.cursor(query),
      }
    },

    countModels: query => {
      return {
        type: modelAdmin.actionType + '_COUNT',
        request: Model.count(query),
      }
    },

    saveModel: data => {
      const model = new Model(data)
      return {
        type: modelAdmin.actionType + '_SAVE',
        request: model.save(),
      }
    },

    deleteModel: data => {
      return {
        type: modelAdmin.actionType + '_DELETE',
        request: callback => Model.destroy({id: data.id}, callback),
        deletedId: data.id,
      }
    },

    // Synchronousely update models
    updateModel: model => {
      return {
        model,
        type: modelAdmin.actionType + '_UPDATE',
      }
    },

    setRelationIds: (modelId, key, ids) => {
      return {
        modelId,
        key,
        ids,
        type: modelAdmin.actionType + '_SET_RELATION_IDS',
      }
    },

    linkRelation: (_model, relationField, idsKey, id) => {
      const model = new Model(_model)
      return {
        idsKey,
        type: modelAdmin.actionType + '_LINK_RELATION',
        request: model.link(relationField, id),
        modelId: model.id,
        relatedModelId: id,
      }
    },

    unlinkRelation: (_model, relationField, idsKey, id) => {
      const model = new Model(_model)
      return {
        idsKey,
        type: modelAdmin.actionType + '_UNLINK_RELATION',
        request: model.unlink(relationField, id),
        modelId: model.id,
        relatedModelId: id,
      }
    },
  }
}
