import { createModel } from 'stein-orm'
import HttpStore from './Store'


export default function createHttpModel(options={}) {
  options.Store = HttpStore
  return createModel(options)
}
