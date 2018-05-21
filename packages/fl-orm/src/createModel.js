import _ from 'lodash'
import Schema from './Schema'
import Store from './flsql/Store'


export default function createModel(options={}) {
  return function decorator(modelType) {
    if (!modelType) throw new Error(`[createModel]: Model class not supplied`)
    modelType.modelName = options.name || modelType.name

    modelType.schema = new Schema(modelType, _.clone(options.schema))
    process.nextTick(() => modelType.schema.initialize())

    if (!modelType.store) {
      modelType.store = new Store(modelType, options)
    }
    modelType.url = modelType.store.url
    modelType.table = modelType.tableName = modelType.store.table

    return modelType
  }
}
