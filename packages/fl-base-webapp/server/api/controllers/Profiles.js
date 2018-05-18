import _ from 'lodash' // eslint-disable-line
import Queue from 'queue-async'
import RestController from 'fl-backbone-rest'
import { JSONUtils } from 'backbone-orm'
import { createAuthMiddleware } from 'fl-auth-server'
import Profile from '../../models/Profile'


export function canAccess(options, callback) {
  const {user, req} = options
  if (!user) return callback(null, false)
  if (user.admin) return callback(null, true)

  const query = JSONUtils.parseQuery(req.query)
  if (query.$include) return callback(null, false, 'No $include')
  if (req.method === 'POST') return callback(null, false)

  // Allow editing for the owner of the profile
  if (req.method === 'PUT') {
    if (!req.body.user_id) return callback(null, false)
    if (req.body.user_id !== user.id) return callback(null, false)
    return Profile.exists({id: req.params.id, user_id: user.id}, callback)
  }

  if (req.method === 'GET') {
    // Allow access for the owner of the profile
    if (query.user_id === user.id) return callback(null, true)

    // Allow basic info access for anyone
    if (process.env.NODE_ENV === 'production')  {
      req.query.deleted = false
      req.query.visible = true
    }

    return callback(null, true)
  }

  callback(null, false)
}

const log = (...args) => process.env.DEBUG && console.log(...args)


export default class ProfilesController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      model_type: Profile,
      route: '/api/profiles',
      auth: [...options.auth, createAuthMiddleware({canAccess})],
      templates: {
        base: require('../templates/profiles/base'),
      },
      defaultTemplate: 'detail',
    }, options))
  }

  //todo: when the detail template renders after a save the user_id field isn't present
  // see ../templates/profiles/detail
  update(req, res) {
    req.body.updatedDate = new Date()
    req.body.displayName = `${req.body.firstName} ${req.body.lastName}`
    super.update(req, res)
  }
}
