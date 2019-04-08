
export default options =>
`import ${options.variableName} from '../../models/${options.variableName}'

export const TYPES = {
  ${options.actionName}_SAVE: '${options.actionName}_SAVE',
  ${options.actionName}_LOAD: '${options.actionName}_LOAD',
  ${options.actionName}_DELETE: '${options.actionName}_DELETE',
}

export function save${options.variableName}(group) {
  const model = new ${options.variableName}(group)
  return {
    type: TYPES.${options.actionName}_SAVE,
    request: model.save.bind(model),
  }
}

export function load${options.variableName}s(query) {
  query.$sort = '-createdDate'
  return {
    type: TYPES.${options.actionName}_LOAD,
    request: ${options.variableName}.cursor(query),
  }
}

export function delete${options.variableName}(data) {
  const model = new ${options.variableName}(data)
  return {
    type: TYPES.${options.actionName}_DELETE,
    request: model.destroy.bind(model),
    deletedModel: data,
  }
}
`
