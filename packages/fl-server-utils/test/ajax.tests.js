import expect from 'expect'
import { createBasicAjax } from '../src'

describe('createBasicAjax', () => {

  it('creates a function', () => {
    expect(createBasicAjax({})).toBeA('function')
  })

})
