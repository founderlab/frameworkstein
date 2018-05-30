import _ from 'lodash'
import expect from 'expect'
import Immutable, {fromJS} from 'immutable'
import types from '../src/action_types'
import { reducer } from '../src'

const suffixes = {
  START: '_START',
  ERROR: '_ERROR',
  SUCCESS: '_SUCCESS',
}

const ACCESS_TOKEN = 'asdf'
const EMAIL = 'a@example.co'

describe('reducer', () => {


  it('should return the initial state', () => {
    expect(Immutable.is(reducer(undefined, {}), new Immutable.Map())).toBe(true)
  })


  it('should handle LOGOUT', () => {
    const initialState = new Immutable.Map()
    const result = reducer(initialState, {
      type: types.LOGOUT,
    })
    const expected = new Immutable.Map({})
    expect(Immutable.is(result, expected)).toBe(true)
  })

  it('Should handle *_START actions', () => {
    _.forEach(types, type => {
      if (type === 'LOGOUT') return
      const initialState = new Immutable.Map()
      const result = reducer(initialState, {
        type: type + suffixes.START,
      })
      const expected = new Immutable.Map({loading: true, errors: null, resetEmailSent: false})
      expect(Immutable.is(result, expected)).toBe(true, `${type}_START works`)
    })
  })

  it('Should handle *_ERROR actions', () => {
    _.forEach(types, type => {
      if (type === 'LOGOUT') return
      const initialState = new Immutable.Map()
      const error = 'bad things'
      const actions = [{
        type: type + suffixes.ERROR,
        error,
      }, {
        type: type + suffixes.ERROR,
        res: {body: {error}},
      }]
      actions.forEach(action => {
        const result = reducer(initialState, action)
        const expected = fromJS({loading: false, errors: {[type.toLowerCase()]: error}})
        expect(Immutable.is(result, expected)).toBe(true, `${type}_ERROR works for ${JSON.stringify(action)}`)
      })
    })
  })

  it('Should handle *_SUCCESS login actions', () => {
    _.forEach(['LOGIN', 'REGISTER', 'RESET'], type => {

      const initialState = new Immutable.Map()
      const action = {
        type: type + suffixes.SUCCESS,
        res: {body: {accessToken: ACCESS_TOKEN, user: {email: EMAIL}}},
      }
      const result = reducer(initialState, action)
      const expected = fromJS({loading: false, errors: null, accessToken: ACCESS_TOKEN, user: {email: EMAIL}})

      expect(Immutable.is(result, expected)).toBe(true, `${type}_SUCCESS works for ${JSON.stringify(action)}`)

    })
  })

  it('should handle RESET_REQUEST_SUCCESS', () => {
    const initialState = new Immutable.Map()
    const action = {
      type: types.RESET_REQUEST + suffixes.SUCCESS,
      res: {body: {}},
    }
    const result = reducer(initialState, action)
    const expected = fromJS({loading: false, errors: null, resetEmailSent: true})
    expect(Immutable.is(result, expected)).toBe(true)
  })

})
