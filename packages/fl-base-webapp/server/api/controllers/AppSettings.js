import _ from 'lodash' // eslint-disable-line
import RestController from 'stein-orm-rest'
import { createAuthMiddleware } from 'fl-auth-server'


function canAccess(options, callback) {
  const {user, req} = options
  if (req.method === 'GET') return callback(null, true)
  if (!user) return callback(null, false)
  if (user.admin) return callback(null, true)
  callback(null, false)
}

export default class AppSettingsController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      modelType: require('../../models/AppSettings'),
      route: '/api/app_settings',
      auth: [...options.auth, createAuthMiddleware({canAccess})],
      templates: {
        detail: require('../templates/appSettings/detail'),
      },
      defaultTemplate: 'detail',
    }, options))
  }
}
