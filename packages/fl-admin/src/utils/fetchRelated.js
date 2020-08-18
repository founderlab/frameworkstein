import _ from 'lodash'


export function onlyExistingRelationsFilter(modelIds, modelStore, relationField) {
  const relatedIds = []
  _.forEach(modelStore.get('models').toJSON(), (model, id) => {
    const relatedId = model[relationField.virtualIdAccessor]
    if (relatedId && _.includes(modelIds, id)) relatedIds.push(relatedId)
  })
  if (!relatedIds.length) return null
  return {$ids: _.uniq(relatedIds)}
}

function relatedQuery(modelIds, modelStore, relationField) {
  const query = _.clone(relationField.modelAdmin.query || {})
  if (!relationField.relation.reverseRelation) {
    return null
  }

  if (relationField.filter) {
    return relationField.filter(modelIds, modelStore, relationField)
  }
  else if (relationField.type === 'belongsTo') {
    return query
  }

  return {
    ...query,
    [relationField.relation.reverseRelation.virtualIdAccessor]: {$in: modelIds},
  }
}

async function fetchOneManyToMany(relationField, modelId, options) {
  const { store, modelAdmin } = options
  const { auth } = store.getState()

  const query = {
    [relationField.relation.foreignKey]: modelId,
    $user_id: auth.get('user').get('id'),
  }

  const relatedAction = await store.dispatch(relationField.modelAdmin.actions.loadModels(query))
  return store.dispatch(modelAdmin.actions.setRelationIds(modelId, relationField.relation.virtualIdAccessor, relatedAction.ids))
}

async function fetchManyToMany(relationField, options) {
  const { modelIds } = options
  const promises = []

  for (const id of modelIds) {
    promises.push(fetchOneManyToMany(relationField, id, options))
  }

  return Promise.all(promises)
}

// dispatch actions to load related models
export default async function fetchRelated(options) {
  const { store, modelAdmin, loadAll, modelIds } = options
  const { auth, admin } = store.getState()
  const modelStore = admin[modelAdmin.path]
  const promises = []

  for (const key in modelAdmin.relationFields) {
    const relationField = modelAdmin.relationFields[key]
    if (!relationField.modelAdmin || !(loadAll || relationField.listEdit) || relationField.fetch === false) continue

    // load m2m relations serially so they can be placed on the model
    if (relationField.relation.isManyToMany()) {
      await fetchManyToMany(relationField, options)
    }
    else {
      const query = relatedQuery(modelIds, modelStore, relationField)
      if (!query) continue

      // load other relations in parallel
      query.$user_id = auth.get('user').get('id')
      promises.push(store.dispatch(relationField.modelAdmin.actions.loadModels(query)))
    }
  }
  return Promise.all(promises)
}
