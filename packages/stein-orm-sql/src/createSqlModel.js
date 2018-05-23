import { createModel } from 'stein-orm'
import SqlStore from './Store'


export default function createSqlModel(options={}) {
  options.Store = SqlStore
  return createModel(options)
}
