import _ from 'lodash'

export function isModel(action) { return action.res && _.isFunction(action.res.toJSON) }

export function parseJSON(action) {
  let modelList = action.res ? action.res.body || action.res : null
  if (!_.isArray(modelList)) modelList = [modelList]
  const model = modelList[0]
  const status = (action.res && action.res.status) || (model ? 200 : 404)
  const models = {}
  const ids = []
  _.forEach(modelList, model => {
    if (_.isNil(model && model.id)) return
    model.id = model.id.toString()
    models[model.id] = model
    ids.push(model.id)
  })
  return {model, models, modelList, ids, status, ...action}
}

export function parseModel(action) {
  action.res = action.res ? action.res.toJSON() : null
  return parseJSON(action)
}

const defaults = {
  isModel,
  parseModel,
  parseJSON,
}

export default function createResponseParserMiddleware(_options={}) {
  const options = _.merge({}, defaults, _options)

  return function responseParserMiddleware() {
    return next => action => {
      return next(options.isModel(action) ? options.parseModel(action) : options.parseJSON(action))
    }
  }
}
