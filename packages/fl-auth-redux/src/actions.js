import fetch from 'cross-fetch'
import types from './action_types'


export function login(url, email, password, callback) {
  return {
    type: types.LOGIN,
    request: fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    }),

    callback,
  }
}

export function register(url, data, callback) {
  return {
    type: types.REGISTER,
    request: fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),

    callback,
  }
}

export function reset(url, email, password, resetToken, callback) {
  return {
    type: types.RESET,
    request: fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password, resetToken}),
    }),
    callback,
  }
}

export function resetRequest(url, email, callback) {
  return {
    type: types.RESET_REQUEST,
    request: fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email}),
    }),
    callback,
  }
}

export function confirmEmail(url, email, token, callback) {
  return {
    type: types.CONFIRM_EMAIL,
    request: fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, token}),
    }),
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

export default {register, login, reset, resetRequest, confirmEmail, logout, updateUser}
