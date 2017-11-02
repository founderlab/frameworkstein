import expect from 'expect'
import {validationState, validateEmailPass} from '../src/validation'


describe('validationState', () => {

  it('should return null when valid', () => {
    expect(validationState({notAnError: 'yup'})).toEqual(null)
  })

  it('should return null when invalid and not touched', () => {
    expect(validationState({error: 'yup'})).toEqual(null)
  })

  it('should return error when invalid and touched', () => {
    expect(validationState({touched: true, error: 'yup'})).toEqual('error')
  })

})

describe('validateEmailPass', () => {

  it('should not give an error without an email', () => {
    const data = {email: null}
    expect(validateEmailPass(data)).toEqual({})
  })

  it('should not give an error with a valid email', () => {
    const data = {email: 'a@b.co'}
    expect(validateEmailPass(data)).toEqual({})
  })

  it('should give an error with an invalid email', () => {
    const data = {email: 'whatisthisnotanemail%%'}
    expect(validateEmailPass(data).email).toExist()
  })

})
