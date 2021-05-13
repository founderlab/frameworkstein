/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import { spy } from 'sinon'
import { createRequestMiddleware } from '../src'

const suffixes = {
  START: '_START',
  ERROR: '_ERROR',
  SUCCESS: '_SUCCESS',
}
const TYPE = 'ACTIONTYPE'

function createSpy() {
  return spy(action => {
    expect(action).toBeTruthy()
  })
}

function createMiddlewareSpy() {
  const nextFn = spy(action => {
    expect(action).toBeTruthy()

    if (nextFn.calledOnce) {
      expect(action.type).toEqual(TYPE + suffixes.START)
    }
    else if (nextFn.calledTwice) {
      if (action.error || !action.res || action.res.ok === false) {
        expect(action.type).toEqual(TYPE + suffixes.ERROR)
      }
      else {
        expect(action.res).toBeTruthy()
        expect(action.type).toEqual(TYPE + suffixes.SUCCESS)
      }
    }
  })
  return nextFn
}

describe('requestMiddleware', () => {

  it('Passes through an action without a request', async () => {
    const next = createSpy()
    const action = {type: TYPE}
    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

  it('Passes through an action with a request field that isnt a function', async () => {
    const next = createSpy()
    const action = {type: TYPE, request: 'lol'}
    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

  it('Runs an action with a custom executeRequest method', async () => {
    const next = createSpy()
    const action = {type: TYPE, req: 'lol', request: () => {}}
    const middleware = createRequestMiddleware({
      executeRequest: request => request(),
      retry: false,
    })
    await middleware()(next)(action)
    expect(next.calledTwice).toBeTruthy()
  })

  it('Calls a request', async () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Calls a request with retries', async () => {
    const retries = 4
    let called = 0
    const req = {end: spy(callback => ++called < retries-2 ? callback({status: 500}) : callback(null, {ok: true}))}
    const next = createMiddlewareSpy()

    const action = {
      type: TYPE,
      request: req,
    }

    const middleware = createRequestMiddleware({retry: {retries, minTimeout: 0, maxTimeout: 0}})
    const a = await middleware()(next)(action)
    expect(next.calledTwice).toBeTruthy()
    expect(req.end.callCount).toEqual(retries-2)
  })

  it('Succeeds when res.ok isnt false', async () => {
    const req = {end: spy(callback => callback(null, [{json: 'yep'}]))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Calls a pure function request', async () => {
    const req = spy(callback => callback(null, {ok: true}))
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(req.calledOnce).toBeTruthy()
  })

  it('Calls an async function request', async () => {
    const req = spy(async () => ({ok: true}))
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(req.calledOnce).toBeTruthy()
  })

  it('Custom parses a response', async () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const wrapper = action => {
      if (action.type === TYPE + suffixes.SUCCESS) expect(action.changed).toEqual('yup')
      next(action)
    }
    const action = {type: TYPE, request: req, parseResponse: action => ({changed: 'yup', ...action})}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(wrapper)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Calls a request then calls a callback', async () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const callback = spy(err => {expect(!err).toBeTruthy()})
    const action = {callback, type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    await middleware()(next)(action)

    expect(next.calledTwice).toBeTruthy()
    expect(callback.calledOnce).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Errors from an error callback', async () => {
    const req = {end: spy(callback => callback(new Error('failed')))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    try {
      const middleware = createRequestMiddleware({retry: false})
      await middleware()(next)(action)
    }
    catch (err) {
      expect(next.calledTwice).toBeTruthy()
      expect(req.end.calledOnce).toBeTruthy()
      expect(err).toBeTruthy()
    }
  })

  it('Errors from an error callback after retries', async () => {
    const times = 4
    const req = {end: spy(callback => callback({error: 'failed', status: 500}))}
    const next = createMiddlewareSpy()

    const action = {
      type: TYPE,
      request: req,
      callback: err => {
        expect(err).toBeTruthy()
        expect(next.calledTwice).toBeTruthy()
        expect(req.end.callCount).toEqual(times)
      },
    }

    const middleware = createRequestMiddleware({retry: {times, minTimeout: 0, maxTimeout: 0}})
    await middleware()(next)(action)
  })

  it('Errors from an error body property', async () => {
    const req = {end: spy(callback => callback(null, {body: {error: 'failed'}}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    try {
      const middleware = createRequestMiddleware({retry: {retries: 2, minTimeout: 0, maxTimeout: 0}})
      await middleware()(next)(action)
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Errors from a bad status', async () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: 'some stack trace'}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    try {
      const middleware = createRequestMiddleware({retry: {retries: 2, minTimeout: 0, maxTimeout: 0}})
      await middleware()(next)(action)
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })

  it('Errors from a bad status without a body', async () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: null, status: 500}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    try {
      const middleware = createRequestMiddleware({retry: {retries: 2, minTimeout: 0, maxTimeout: 0}})
      await middleware()(next)(action)
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
    expect(next.calledTwice).toBeTruthy()
    expect(req.end.callCount).toEqual(3)
  })

  it('Errors from a bad status without a body or status', async () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: null, status: null}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    try {
      const middleware = createRequestMiddleware({retry: {retries: 2, minTimeout: 0, maxTimeout: 0}})
      await middleware()(next)(action)
    }
    catch (err) {
      expect(err).toBeTruthy()
    }
    expect(next.calledTwice).toBeTruthy()
    expect(req.end.calledOnce).toBeTruthy()
  })
})
