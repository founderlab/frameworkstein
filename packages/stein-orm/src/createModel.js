import _ from 'lodash'
import Schema from './Schema'


export default function createModel(_options={}) {
  return function decorator(modelType) {
    if (!modelType) throw new Error(`[createModel]: Model class not supplied`)

    const options = _.extend({}, _options, modelType)
    modelType.modelName = options.name || modelType.name
    modelType.schema = new Schema(modelType, options.schema)
    modelType.createModel = options.createModel || createModel

    if (!modelType.store) {
      try {
        const Store = options.Store || require('stein-orm-sql').default
        modelType.store = new Store(modelType, options)
      }
      catch (err) {
        const msg = `[stein-orm] Error initializing store, either npm install stein-orm-sql or specifiy provide a Store option to createModel: ${err}`
        console.log(msg, err)
        throw new Error(msg)
      }
    }

    modelType.schema.initialise()

    return modelType
  }
}
