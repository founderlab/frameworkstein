import _ from 'lodash'

export default function template(_models, options, callback) {
  let single = false
  let models = _models
  if (!_.isArray(models)) {
    single = true
    models = [models]
  }
  callback(null, single ? models[0] : models)
}
