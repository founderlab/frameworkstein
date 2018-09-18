import { Model, Schema } from 'stein-orm'
import HttpStore from './Store'
import createModel from './createHttpModel'
import { configure } from './config'

require('util.promisify/shim')()

export default HttpStore

export {
  configure,
  createModel,
  Model,
  Schema,
  HttpStore,
}
