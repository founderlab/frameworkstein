import _ from 'lodash'
import RestController from 'fl-backbone-rest'
import { createAuthMiddleware } from 'fl-auth-server'
import User from '../../models/User'


function canAccess(options, callback) {
  const {user, req} = options
  if (!user) return callback(null, false)
  if (user.admin) return callback(null, true)
  if (req.params.id && (user.id === req.params.id)) return callback(null, true)
  callback(null, false)
}

export default class UsersController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      model_type: User,
      route: '/api/users',
      auth: [...options.auth, createAuthMiddleware({canAccess})],
      whitelist: {
        index: ['id', 'email', 'admin'],
        show: ['id', 'email', 'admin'],
      },
      templates: {
        base: require('../templates/users/base'),
      },
      defaultTemplate: 'base',
    }, options))
  }

  create(req, res) {
    if (!req.body.password) return res.send(402, {error: 'You must supply a password'})
    if (!req.body.email) return res.send(402, {error: 'You must supply an email'})

    req.body.password = User.createHash(req.body.password)
    const user = new User(req.body)
    user.save(err => {
      if (err) return this.sendError(res, err)
      user.onCreate({}, (err, json) => {
        if (err) return this.sendError(res, err)
        res.json(json.user, '_rev', 'password')
      })
    })
  }

  update(req, res) {
    if (req.body.password) {
      req.body.password = User.createHash(req.body.password)
    }
    super.update(req, res)
  }

  redirect = (req, res) => {
    if (req.session.returnTo) {
      return res.redirect(req.session.returnTo)
    }
    res.redirect('/')
  }
}
