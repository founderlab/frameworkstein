import expect from 'expect'
import _ from 'lodash'
import {createGroupByReducer} from '../src'

describe('createGroupByReducer', () => {

  it('creates a reducer function that groups items on load and removes items on delete', () => {
    const files = [{
      id: 1,
      lessonId: 1,
    }, {
      id: 2,
      lessonId: 1,
    }, {
      id: 3,
      lessonId: 2,
    }]
    const reducer = createGroupByReducer(['LOAD', 'DELETE'], file => file.lessonId)

    expect(reducer).toBeA('function')

    let state = reducer()
    expect(state).toBeAn('object')
    expect(_.isEmpty(state.toJSON())).toExist()

    state = reducer(state, {type: 'LOAD', models: files})
    let json = state.toJSON()

    expect(json[1].length).toBe(2)
    expect(json[1][0]).toBe(1)
    expect(json[1][1]).toBe(2)
    expect(json[2].length).toBe(1)
    expect(json[2][0]).toBe(3)

    state = reducer(state, {type: 'DELETE', deletedModel: {id: 1, lessonId: 1}})
    json = state.toJSON()

    expect(json[1].length).toBe(1)
    expect(json[1][0]).toBe(2)
    expect(json[1][1]).toNotExist()
    expect(json[2].length).toBe(1)
    expect(json[2][0]).toBe(3)
  })

  it('creates a reducer function that groups with options.single', () => {
    const files = [{
      id: 1,
      lessonId: 1,
    }, {
      id: 3,
      lessonId: 2,
    }]
    const reducer = createGroupByReducer(['LOAD', 'DELETE'], file => file.lessonId, {single: true})

    expect(reducer).toBeA('function')

    let state = reducer()
    expect(state).toBeAn('object')
    expect(_.isEmpty(state.toJSON())).toExist()

    state = reducer(state, {type: 'LOAD', models: files})
    let json = state.toJSON()
    expect(json[1]).toBe(1)
    expect(json[2]).toBe(3)

    state = reducer(state, {type: 'DELETE', deletedModel: {id: 1, lessonId: 1}})
    json = state.toJSON()

    expect(json[1]).toNotExist()
    expect(json[2]).toBe(3)

  })

})
