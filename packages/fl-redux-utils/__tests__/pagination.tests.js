import expect from 'expect'
import _ from 'lodash'
import { fromJS } from 'immutable'
import { createPaginationReducer, createPaginationSelector } from '../src'


function testPagination(pagination, cacheKey) {
  const files = [{
    id: '1',
  }, {
    id: '2',
  }, {
    id: '3',
  }]
  const files2 = [{
    id: '4',
  }, {
    id: '5',
  }, {
    id: '6',
  }]
  const ids = _.map(files, 'id')
  const ids2 = _.map(files2, 'id')

  const page1 = 1
  const page2 = 2

  expect(typeof pagination).toEqual('function')

  let state = pagination()

  state = pagination(state, {
    cacheKey,
    type: 'FILE_COUNT_SUCCESS',
    res: files.length + files2.length,
  })
  expect(typeof state).toEqual('object')
  expect(state.get('total')).toEqual(files.length + files2.length)

  state = pagination(state, {
    cacheKey,
    ids,
    type: 'FILE_LOAD_SUCCESS',
    models: files,
    page: page1,
  })
  expect(state.get('currentPage')).toEqual(page1)
  expect(state.get('pages').get(page1.toString()).toJSON()).toEqual(ids)

  state = pagination(state, {
    cacheKey,
    ids: ids2,
    type: 'FILE_LOAD_SUCCESS',
    models: files2,
    page: page2,
  })
  expect(state.get('currentPage')).toEqual(page2)
  expect(state.get('pages').get(page2.toString()).toJSON()).toEqual(ids2)

  state = pagination(state, {
    cacheKey,
    type: 'FILE_DEL_SUCCESS',
    deletedId: '1',
  })
  const newIds = state.get('pages').get(page1.toString()).toJSON()
  const page1Ids = _.without(ids, '1')
  expect(newIds).toEqual(page1Ids)
  expect(_.find(newIds, '1')).toBeFalsy()

  state = pagination(state, {
    type: 'FILE_DEL_SUCCESS',
    deletedId: '4',
  })
  const newIds2 = state.get('pages').get(page2.toString()).toJSON()
  const page2Ids = _.without(ids2, '4')
  expect(newIds2).toEqual(page2Ids)
  expect(_.find(newIds2, '4')).toBeFalsy()

  const models = []
  _.forEach([...files, ...files2], f => models[f.id] = f)

  return { state, models, page1Ids, page2Ids }
}


describe('createPaginationReducer', () => {

  it('creates a reducer and selector without append', () => {
    const paginationName = 'filePagination'
    const selectPagination = createPaginationSelector('files', {paginationName})
    const pagination = createPaginationReducer('FILE')

    const { state, models, page2Ids } = testPagination(pagination)

    const rootState = {
      files: fromJS({
        models,
        filePagination: state,
      }),
    }
    const results = selectPagination(rootState)

    expect(results.currentPage).toEqual(2)
    expect(results.totalItems).toEqual(6)
    expect(results.visibleIds).toEqual(page2Ids)
    expect(_.map(results.visibleItems, 'id')).toEqual(page2Ids)
  })


  it('creates a reducer and selector with append', () => {
    const paginationName = 'filePagination'
    const selectPagination = createPaginationSelector('files', {paginationName})
    const pagination = createPaginationReducer('FILE', {append: true})

    const { state, models, page1Ids, page2Ids } = testPagination(pagination)

    const rootState = {
      files: fromJS({
        models,
        filePagination: state,
      }),
    }

    const results = selectPagination(rootState)
    expect(results.currentPage).toEqual(2)
    expect(results.totalItems).toEqual(6)
    expect(results.visibleIds).toEqual([...page1Ids, ...page2Ids])
    expect(_.map(results.visibleItems, 'id')).toEqual([...page1Ids, ...page2Ids])
  })

})
