import Schema from './Schema'


export default function createModel(options={}) {
  return function decorator(modelType) {
    if (!modelType) throw new Error(`[createModel]: Model class not supplied`)
    modelType.modelName = options.name || modelType.name

    modelType.schema = new Schema(modelType, options.schema)
    process.nextTick(() => modelType.schema.initialize())

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
    modelType.url = modelType.store.url
    modelType.table = modelType.tableName = modelType.store.table

    return modelType
  }
}
