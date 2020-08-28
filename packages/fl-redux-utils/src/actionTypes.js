import _ from 'lodash'


export default function actionTypes(actionTypes) {
  let load
  let del
  let save
  let count
  let clear
  let cacheRestore
  let cacheClear
  const actions = {
    loadActions: [],
    deleteActions: [],
    saveActions: [],
    countActions: [],
    clearActions: [],
    cacheRestoreActions: [],
    cacheClearActions: [],
  }

  if (_.isString(actionTypes)) {
    load = [actionTypes + '_LOAD_SUCCESS']
    del = [actionTypes + '_DELETE_SUCCESS', actionTypes + '_DEL_SUCCESS']
    save = [actionTypes + '_SAVE_SUCCESS']
    count = [actionTypes + '_COUNT_SUCCESS']
    clear = [actionTypes + '_CLEAR']
    cacheRestore = [actionTypes + '_CACHE_RESTORE']
    cacheClear = [actionTypes + '_CACHE_CLEAR']
  }
  else if (_.isArray(actionTypes)) {
    load = actionTypes[0]
    del = actionTypes[1]
  }
  else if (_.isObject(actionTypes)) {
    load = actionTypes.load || [actionTypes.baseType + '_LOAD_SUCCESS']
    del = actionTypes.del || actionTypes.delete || [actionTypes.baseType + '_DELETE_SUCCESS', actionTypes.baseType + '_DEL_SUCCESS']
    save = actionTypes.save || [actionTypes.baseType + '_SAVE_SUCCESS']

    count = actionTypes.count || [actionTypes.baseType + '_COUNT_SUCCESS']
    clear = actionTypes.clear || [actionTypes.baseType + '_CLEAR']
    cacheRestore = actionTypes.cacheRestore || [actionTypes.baseType + '_CACHE_RESTORE']
    cacheClear = actionTypes.cacheClear || [actionTypes.baseType + '_CACHE_CLEAR']
  }

  if (load) actions.loadActions = _.isArray(load) ? load : [load]
  if (del) actions.deleteActions = _.isArray(del) ? del : [del]
  if (save) actions.saveActions = _.isArray(save) ? save : [save]
  if (count) actions.countActions = _.isArray(count) ? count : [count]
  if (clear) actions.clearActions = _.isArray(clear) ? clear : [clear]
  if (cacheRestore) actions.cacheRestoreActions = _.isArray(cacheRestore) ? cacheRestore : [cacheRestore]
  if (cacheClear) actions.cacheClearActions = _.isArray(cacheClear) ? cacheClear : [cacheClear]

  return actions
}
