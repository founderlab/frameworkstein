import expect from 'expect'
import {createServerRenderer} from '../src'

describe('createServerRenderer', () => {

  it('createServerRenderer creates a function', () => {
    const app = createServerRenderer({createStore: true, getRoutes: true})
    expect(app).toBeA('function')
  })

})
