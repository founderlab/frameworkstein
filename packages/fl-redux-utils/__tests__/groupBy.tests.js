import expect from 'expect'
import _ from 'lodash'
import { createGroupByReducer } from '../src'

describe('createGroupByReducer', () => {

  it('creates a reducer function that groups items on load and removes items on delete', () => {
    const files = [{
      id: '1',
      lessonId: '1',
    }, {
      id: '2',
      lessonId: '1',
    }, {
      id: '3',
      lessonId: '2',
    }]
    const reducer = createGroupByReducer(['LOAD', 'DELETE'], file => file.lessonId)

    expect(typeof reducer).toEqual('function')

    let state = reducer()
    expect(typeof state).toEqual('object')
    expect(_.isEmpty(state.toJSON())).toBeTruthy()

    state = reducer(state, {type: 'LOAD', models: files})
    let json = state.toJSON()

    expect(json[1].length).toEqual(2)
    expect(json[1][0]).toEqual('1')
    expect(json[1][1]).toEqual('2')
    expect(json[2].length).toEqual(1)
    expect(json[2][0]).toEqual('3')

    state = reducer(state, {type: 'DELETE', deletedModel: {id: 1, lessonId: 1}})
    json = state.toJSON()

    expect(json[1].length).toEqual(1)
    expect(json[1][0]).toEqual('2')
    expect(json[1][1]).toBeFalsy()
    expect(json[2].length).toEqual(1)
    expect(json[2][0]).toEqual('3')
  })

  it('creates a reducer function that groups with options.single', () => {
    const files = [{
      id: '1',
      lessonId: '1',
    }, {
      id: '3',
      lessonId: '2',
    }]
    const reducer = createGroupByReducer(['LOAD', 'DELETE'], file => file.lessonId, {single: true})

    expect(typeof reducer).toEqual('function')

    let state = reducer()
    expect(typeof state).toEqual('object')
    expect(_.isEmpty(state.toJSON())).toBeTruthy()

    state = reducer(state, {type: 'LOAD', models: files})
    let json = state.toJSON()

    expect(json[1]).toEqual('1')
    expect(json[2]).toEqual('3')

    state = reducer(state, {type: 'DELETE', deletedModel: {id: 1, lessonId: 1}})
    json = state.toJSON()

    expect(json[1]).toBeFalsy()
    expect(json[2]).toEqual('3')

  })

})
