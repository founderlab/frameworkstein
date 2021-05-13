import expect from 'expect'
import { spy } from 'sinon'
import { fetchComponentData } from '../src'


describe('fetchComponentData', () => {

  it('Calls async fetchData on each component ', done => {
    const options = {store: 'store', action: 'action'}

    const fetchSpy = spy(async ({store, action}) => {
      expect(store).toEqual(options.store)
      expect(action).toEqual(options.action)
      return {status: 200}
    })

    options.branch = [{
      route: {
        component: {
          fetchData: fetchSpy,
        },
      },
    }, {
      route: {
        component: {
          WrappedComponent: {
            fetchData: fetchSpy,
          },
        },
      },
    }]

    fetchComponentData(options, (err, res) => {
      expect(err).toBeFalsy()
      expect(res).toBeTruthy()
      expect(res.status).toEqual(200)
      expect(fetchSpy.calledTwice).toBeTruthy()
      done()
    })
  })

  it('Calls callback fetchData on each component ', done => {
    const options = {store: 'store', action: 'action'}

    const fetchSpy = spy(({store, action}, callback) => {
      expect(store).toEqual(options.store)
      expect(action).toEqual(options.action)
      callback(null, {status: 200})
    })

    options.branch = [{
      route: {
        component: {
          fetchData: fetchSpy,
        },
      },
    }, {
      route: {
        component: {
          WrappedComponent: {
            fetchData: fetchSpy,
          },
        },
      },
    }]

    fetchComponentData(options, (err, res) => {
      expect(err).toBeFalsy()
      expect(res).toBeTruthy()
      expect(res.status).toEqual(200)
      expect(fetchSpy.calledTwice).toBeTruthy()
      done()
    })
  })

  it('Does nothing if components are null or lack fetchData', done => {
    const options = {components: [null, {}]}
    options.branch = [{
      route: {
        component: null,
      },
    }, {
      route: {
        component: {
          WrappedComponent: {
          },
        },
      },
    }]
    fetchComponentData(options, (err, res) => {
      expect(err).toBeFalsy()
      expect(res).toBeTruthy()
      done()
    })
  })

})
