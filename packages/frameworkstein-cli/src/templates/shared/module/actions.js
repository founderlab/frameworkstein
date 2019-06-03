
export default options =>
`import ${options.className} from '../../models/${options.className}'


export const TYPES = {
  ${options.actionName}_SAVE: '${options.actionName}_SAVE',
  ${options.actionName}_LOAD: '${options.actionName}_LOAD',
  ${options.actionName}_DELETE: '${options.actionName}_DELETE',
  ${options.actionName}_LOCAL_UPDATE: '${options.actionName}_LOCAL_UPDATE',
  ${options.actionName}_LINK_RELATION: '${options.actionName}_LINK_RELATION',
  ${options.actionName}_UNLINK_RELATION: '${options.actionName}_UNLINK_RELATION',
}

export function save${options.className}(group) {
  const model = new ${options.className}(group)
  return {
    type: TYPES.${options.actionName}_SAVE,
    request: model.save.bind(model),
  }
}

export function load${options.classPlural}(query) {
  query.$sort = '-createdDate'
  return {
    type: TYPES.${options.actionName}_LOAD,
    request: ${options.className}.cursor(query),
  }
}

export function delete${options.className}(data) {
  const model = new ${options.className}(data)
  return {
    type: TYPES.${options.actionName}_DELETE,
    request: model.destroy.bind(model),
    deletedModel: data,
  }
}

export function update${options.className}(model) {
  return {
    model,
    type: TYPES.${options.actionName}_LOCAL_UPDATE,
  }
}

export function linkRelation(_model, relationField, idsKey, relatedModelId) {
  const model = new ${options.className}(_model)
  return {
    idsKey,
    relatedModelId,
    type: TYPES.${options.actionName}_LINK_RELATION,
    request: model.link(relationField, relatedModelId),
    modelId: model.id,
  }
}

export function unlinkRelation(_model, relationField, idsKey, relatedModelId) {
  const model = new ${options.className}(_model)
  return {
    idsKey,
    relatedModelId,
    type: TYPES.${options.actionName}_UNLINK_RELATION,
    request: model.unlink(relationField, relatedModelId),
    modelId: model.id,
  }
}
`
