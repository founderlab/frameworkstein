import _ from 'lodash'

export function isModel(action) { return action.res && _.isFunction(action.res.toJSON) }

export function parseJSON(action, {mutate}) {
  let modelList = action.res ? action.res.body || action.res : null
  let single = false
  if (!_.isArray(modelList)) {
    single = true
    modelList = modelList ? [modelList] : []
  }
  const model = modelList[0]
  let status = 200
  if (action.res && (_.isFunction(action.res.json) || action.res.body) && action.res.status && +action.res.status) {
    status = action.res.status
  }
  else if (single && !model) {
    status = 404
  }
  const models = {}
  const ids = []
  _.forEach(modelList, model => {
    if (_.isNil(model && model.id)) return
    model.id = model.id.toString()
    models[model.id] = model
    ids.push(model.id)
  })
  const data = {model, models, modelList, ids, status}
  return mutate ? _.extend(action, data) : {...action, ...data}
}

export function parseModel(action, options) {
  action.res = action.res ? action.res.toJSON() : null
  return parseJSON(action, options)
}

const defaults = {
  isModel,
  parseModel,
  parseJSON,
  mutate: true,
}

export default function createResponseParserMiddleware(_options={}) {
  const options = _.merge({}, defaults, _options)

  return function responseParserMiddleware() {
    return next => action => {
      return next(options.isModel(action) ? options.parseModel(action, options) : options.parseJSON(action, options))
    }
  }
}
