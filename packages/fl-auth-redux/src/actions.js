import request from 'superagent'
import types from './action_types'

export function login(url, email, password, callback) {
  return {
    type: types.LOGIN,
    request: request.post(url).send({email, password}),
    callback,
  }
}

export function register(url, data, callback) {
  return {
    type: types.REGISTER,
    request: request.post(url).send(data),
    callback,
  }
}

export function reset(url, email, password, resetToken, callback) {
  return {
    type: types.RESET,
    request: request.post(url).send({email, password, resetToken}),
    callback,
  }
}

export function resetRequest(url, email, callback) {
  return {
    type: types.RESET_REQUEST,
    request: request.post(url).send({email}),
    callback,
  }
}

export function confirmEmail(url, email, token, callback) {
  return {
    type: types.CONFIRM_EMAIL,
    request: request.post(url).send({email, token}),
    callback,
  }
}

export function logout() {
  return {
    type: types.LOGOUT,
    payload: {},
  }
}

export function updateUser(user, callback) {
  return {
    user,
    type: types.USER_UPDATE,
    callback,
  }
}

export default {register, login, reset, resetRequest, logout, updateUser}
