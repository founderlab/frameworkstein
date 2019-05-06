
export default options =>
`import ${options.className} from '../../models/${options.className}'

export const TYPES = {
  ${options.actionName}_SAVE: '${options.actionName}_SAVE',
  ${options.actionName}_LOAD: '${options.actionName}_LOAD',
  ${options.actionName}_DELETE: '${options.actionName}_DELETE',
}

export function save${options.className}(group) {
  const model = new ${options.className}(group)
  return {
    type: TYPES.${options.actionName}_SAVE,
    request: model.save.bind(model),
  }
}

export function load${options.className}s(query) {
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
`
