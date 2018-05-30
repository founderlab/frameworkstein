import expect from 'expect'
import types from '../src/action_types'
import { login, actions } from '../src'

const URL = 'http://example.com/stuff'
const EMAIL = 'a@example.com'
const PASSWORD = '123'
const RESET_TOKEN = '098'

describe('actions', () => {

  it('should create an action to login (specific import)', () => {
    const expected = {
      type: types.LOGIN,
      request: {
        url: URL,
        body: {
          email: EMAIL,
          password: PASSWORD,
        },
      },
    }
    const action = login(URL, EMAIL, PASSWORD)
    expect(action.type).toEqual(expected.type)
    expect(action.request.url).toEqual(expected.request.url)
    expect(action.request._data.email).toEqual(expected.request.body.email)
    expect(action.request._data.password).toEqual(expected.request.body.password)
  })

  it('should create an action to register (actions import)', () => {
    const expected = {
      type: types.REGISTER,
      request: {
        url: URL,
        body: {
          email: EMAIL,
          password: PASSWORD,
        },
      },
    }
    const action = actions.register(URL, {email: EMAIL, password: PASSWORD})
    expect(action.type).toEqual(expected.type)
    expect(action.request.url).toEqual(expected.request.url)
    expect(action.request._data.email).toEqual(expected.request.body.email)
    expect(action.request._data.password).toEqual(expected.request.body.password)
  })

  it('should create an action to reset a password', () => {
    const expected = {
      type: types.RESET,
      request: {
        url: URL,
        body: {
          email: EMAIL,
          password: PASSWORD,
          resetToken: RESET_TOKEN,
        },
      },
    }
    const action = actions.reset(URL, EMAIL, PASSWORD, RESET_TOKEN)
    expect(action.type).toEqual(expected.type)
    expect(action.request.url).toEqual(expected.request.url)
    expect(action.request._data.email).toEqual(expected.request.body.email)
    expect(action.request._data.password).toEqual(expected.request.body.password)
    expect(action.request._data.resetToken).toEqual(expected.request.body.resetToken)
  })

  it('should create an action to request a password reset', () => {
    const expected = {
      type: types.RESET_REQUEST,
      request: {
        url: URL,
        body: {
          email: EMAIL,
        },
      },
    }
    const action = actions.resetRequest(URL, EMAIL)
    expect(action.type).toEqual(expected.type)
    expect(action.request.url).toEqual(expected.request.url)
    expect(action.request._data.email).toEqual(expected.request.body.email)
  })

  it('should create an action to logout', () => {
    const expected = {
      type: types.LOGOUT,
      payload: {},
    }
    expect(actions.logout()).toEqual(expected)
  })

})
