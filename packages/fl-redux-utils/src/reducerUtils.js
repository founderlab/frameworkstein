import _ from 'lodash'

export function updateModel(state, model) {
  let newState = state.merge({loading: false, errors: {}}).mergeDeep({models: {[model.id]: model}})

  if (newState.get('modelList')) {
    const modelList = newState.get('modelList').toJSON()
    const index = _.findIndex(modelList, m => m.id === model.id)
    if (index >= 0) modelList[index] = model
    else modelList.unshift(model)
    newState = newState.merge({modelList})
  }

  return newState
}

export function removeModel(state, deletedId) {
  const models = (state.get('models') || {}).toJSON()
  delete models[deletedId]

  let newState = state.merge({
    models,
    loading: false,
    errors: {},
  })

  if (newState.get('modelList')) {
    const modelList = _.filter(newState.get('modelList').toJSON(), m => m.id !== deletedId)
    newState = newState.merge({modelList})
  }

  return newState
}

export function selectGroupedModels(store, groupingField, groupingId) {
  if (!groupingId) return []

  const modelIds = store.get(groupingField).get(groupingId)
  if (!modelIds) return []

  const models = _(modelIds.toJSON()).map(id => {
    const im = store.get('models').get(id)
    if (!im) return null
    return im.toJSON()
  }).compact().value()

  return models
}
