import reducer from './reducer'
import types from './action_types'
import accessTokenMiddleware, { createAccessTokenMiddleware } from './middleware/accessToken'
import { register, login, reset, resetRequest, logout, updateUser } from './actions'

export {
  reducer,
  types,
  accessTokenMiddleware,
  createAccessTokenMiddleware,
  register,
  login,
  reset,
  resetRequest,
  logout,
  updateUser,
}
export default {
  reducer,
  types,
  accessTokenMiddleware,
  createAccessTokenMiddleware,
  register,
  login,
  reset,
  resetRequest,
  logout,
  updateUser,
}
