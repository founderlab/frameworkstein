import expect from 'expect'
import createInternalMiddleware from '../../src/middleware/internal'
// import User from '../../src/models/User'

const SECRET = '123'

describe('internalMiddleware', () => {

  it('should create a function that only returns next() when User or deserializeUser are not present', done => {
    const options = {
      secret: SECRET,
      deserializeUser: null,
    }

    const middleware = createInternalMiddleware(options)
    expect(middleware).toExist()

    middleware(null, null, () => {
      done()
    })
  })

})
