import _ from 'lodash'


export function onlyExistingRelationsFilter(modelIds, modelStore, relationField) {
  const relatedIds = []
  _.forEach(modelStore.get('models').toJSON(), (model, id) => {
    const relatedId = model[relationField.virtual_id_accessor]
    if (_.includes(modelIds, id) && relatedId) relatedIds.push(relatedId)
  })
  if (!relatedIds.length) return null
  return {$ids: _.uniq(relatedIds)}
}

function relatedQuery(modelIds, modelStore, relationField) {
  const query = relationField.modelAdmin.query || {}

  if (relationField.filter) {
    return relationField.filter(modelIds, modelStore, relationField)
  }
  else if (relationField.type === 'belongsTo') {
    return query
  }
  // Many to many, load all options
  // TODO: async load in react-select
  else if (relationField.type === 'hasMany' && relationField.relation.reverse_relation.type === 'hasMany') {
    return query
    // return {[relationField.relation.foreign_key]: {$in: modelIds}}
  }
  return _.extend(query, {[relationField.relation.reverse_relation.virtual_id_accessor]: {$in: modelIds}})
}

// dispatch actions to load related models
// assumes the action to fetch models is called 'load'
export default function fetchRelated(options, callback) {
  const {store, modelAdmin, loadAll, modelIds} = options
  const {auth, admin} = store.getState()
  const modelStore = admin[modelAdmin.path]
  const promises = []

  _.forEach(modelAdmin.relationFields, relationField => {
    if (relationField.modelAdmin && loadAll || relationField.listEdit) {
      const query = relatedQuery(modelIds, modelStore, relationField)
      if (!query) return callback()

      query.$user_id = auth.get('user').get('id')
      promises.push(store.dispatch(relationField.modelAdmin.actions.loadModels(query)))
    }
  })

  return Promise.all(promises)
}
