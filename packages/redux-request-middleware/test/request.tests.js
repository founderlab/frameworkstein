import assert from 'assert'
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
    assert.ok(action)
    assert.ok(action.type === TYPE)
  })
}

function createMiddlewareSpy() {
  const nextFn = spy(action => {
    assert.ok(action)

    if (nextFn.calledOnce) {
      assert.ok(action.type === TYPE + suffixes.START)
    }
    else if (nextFn.calledTwice) {
      if (action.error || !action.res || action.res.ok === false) {
        assert.ok(action.type === TYPE + suffixes.ERROR)
      }
      else {
        assert.ok(action.res)
        assert.ok(action.type === TYPE + suffixes.SUCCESS)
      }
    }
  })
  return nextFn
}

describe('requestMiddleware', () => {

  it('Passes through an action without a request', () => {
    const next = createSpy()
    const action = {type: TYPE}
    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)
    assert.ok(next.calledOnce)
  })

  it('Passes through an action with a request field that isnt a function', () => {
    const next = createSpy()
    const action = {type: TYPE, request: 'lol'}
    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)
    assert.ok(next.calledOnce)
  })

  it('Passes through an action with a custom extractRequest method that isnt a function', () => {
    const next = createSpy()
    const action = {type: TYPE, req: 'lol', request: () => {}}
    const middleware = createRequestMiddleware({
      extractRequest: action => {
        const { req, callback, ...rest } = action
        return {request: req, callback, action: rest}
      },
      retry: false,
    })
    middleware()(next)(action)
    assert.ok(next.calledOnce)
  })

  it('Calls a request', () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Calls a request with retries', () => {
    const times = 4
    let called = 0
    const req = {end: spy(callback => called++ < times-2 ? callback('Err') : callback(null, {ok: true}))}
    const next = createMiddlewareSpy()

    const action = {type: TYPE, request: req, callback: err => {
      assert.ok(!err)
      assert.ok(next.calledTwice)
      assert.equal(req.end.callCount, times-2)
    }}

    const middleware = createRequestMiddleware({retry: {times}})
    middleware()(next)(action)
  })

  it('Succeeds when res.ok isnt false', () => {
    const req = {end: spy(callback => callback(null, [{json: 'yep'}]))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Calls a pure function request', () => {
    const req = spy(callback => callback(null, {ok: true}))
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.calledOnce)
  })

  it('Custom parses a response', () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const wrapper = action => {
      if (action.type === TYPE + suffixes.SUCCESS) assert.equal(action.changed, 'yup')
      next(action)
    }
    const action = {type: TYPE, request: req, parseResponse: action => ({changed: 'yup', ...action})}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(wrapper)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Calls a request then calls a callback', () => {
    const req = {end: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const callback = spy(err => {assert.ok(!err)})
    const action = {callback, type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(callback.calledOnce)
    assert.ok(req.end.calledOnce)
  })

  it('Calls a request with config', () => {
    const req = {next: spy(callback => callback(null, {ok: true}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, aRequest: req}

    const extractRequest = (action) => {
      const { aRequest, ...rest } = action
      return {request: aRequest, action: rest}
    }
    const getEndFn = request => request.next.bind(request)

    const middleware = createRequestMiddleware({extractRequest, getEndFn, retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.next.calledOnce)
  })

  it('Errors from an error callback', () => {
    const req = {end: spy(callback => callback(new Error('failed')))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware({retry: false})
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Errors from an error callback after retries', () => {
    const times = 4
    const req = {end: spy(callback => callback(new Error('failed')))}
    const next = createMiddlewareSpy()

    const action = {type: TYPE, request: req, callback: err => {
      assert.ok(err)
      assert.ok(next.calledTwice)
      assert.equal(req.end.callCount, times-1)
    }}

    const middleware = createRequestMiddleware({retry: {times, interval: 1}})
    middleware()(next)(action)
  })

  it('Errors from an error body property', () => {
    const req = {end: spy(callback => callback(null, {body: {error: 'failed'}}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware()
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Errors from a bad status', () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: 'some stack trace'}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware()
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Errors from a bad status without a body', () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: null, status: 500}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware()
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })

  it('Errors from a bad status without a body or status', () => {
    const req = {end: spy(callback => callback(null, {ok: false, body: null, status: null}))}
    const next = createMiddlewareSpy()
    const action = {type: TYPE, request: req}

    const middleware = createRequestMiddleware()
    middleware()(next)(action)

    assert.ok(next.calledTwice)
    assert.ok(req.end.calledOnce)
  })
})
