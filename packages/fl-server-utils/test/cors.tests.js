import expect from 'expect'
import { spy } from 'sinon'
import { cors } from '../src'

describe('cors', () => {

  it('Adds cors headers and returns status 200 for OPTIONS', done => {
    const req = {
      method: 'OPTIONS',
    }
    const end = spy(() => {
      done()
    })
    const res = {
      set: spy(),
      status: spy(status => {
        expect(status).toBe(200)
        return {
          end,
        }
      }),
    }
    const middleware = cors(['*'])
    expect(middleware).toBeA('function')

    middleware(req, res)
  })

  it('Adds cors headers', done => {
    const req = {
      method: 'GET',
    }
    const res = {
      set: spy(),
    }
    const middleware = cors(['*'])
    expect(middleware).toBeA('function')

    middleware(req, res, () => {

      expect(res.set.callCount).toBe(4)
      done()
    })
  })

  it('allowOrigins adds cors headers to a list of paths', done => {
    const req = {
      method: 'GET',
    }
    const res = {
      set: spy(),
    }
    const middleware = cors(['*'])
    expect(middleware).toBeA('function')

    middleware(req, res, () => {

      expect(res.set.callCount).toBe(4)
      done()
    })
  })

})
