import { createModel } from 'stein-orm'
import HttpStore from './Store'


export default function createHttpModel(options={}) {
  options.Store = HttpStore
  options.createModel = createHttpModel
  return createModel(options)
}
