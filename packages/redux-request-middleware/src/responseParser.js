import _ from 'lodash'

export function isFetch(action) { return action.res && _.isFunction(action.res.json) }

export function isModel(action) { return action.res && _.isFunction(action.res.toJSON) }

export function parseJSON(action, {mutate, force}) {
  if (!force && !action.res) return action

  let modelList = action.modelList || (action.res ? action.res.body || action.res : null)
  let single = false
  if (!_.isArray(modelList)) {
    single = true
    modelList = [modelList]
  }

  const model = action.model || modelList[0]
  const models = action.models || {}
  const ids = []

  if (!action.models) {
    _.forEach(modelList, model => {
      if (_.isNil(model && model.id)) return
      model.id = model.id.toString()
      models[model.id] = model
      ids.push(model.id)
    })
  }

  let status = (action.res && action.res.status)
  if (!status) {
    if (single) status = model ? 200 : 404
    else status = 200
  }

  const data = {model, models, modelList, ids, status}
  return mutate ? _.extend(action, data) : {...action, ...data}
}

export function parseModel(action, options) {
  action.res = action.res ? action.res.toJSON() : null
  return parseJSON(action, options)
}

export async function parseFetch(action, options) {
  action.res = action.res ? await action.res.json() : null
  return parseJSON(action, options)
}

const defaults = {
  isModel,
  isFetch,
  parseModel,
  parseJSON,
  parseFetch,
  mutate: true,
}

export default function createResponseParserMiddleware(_options={}) {
  const options = _.merge({}, defaults, _options)

  return function responseParserMiddleware() {
    return next => async action => {
      let res
      if (options.isModel(action)) res = options.parseModel(action, options)
      else if (options.isFetch(action)) res = await options.parseFetch(action, options)
      else res = options.parseJSON(action, options)
      next(res)
    }
  }
}
