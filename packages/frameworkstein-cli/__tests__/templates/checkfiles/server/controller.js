import _ from 'lodash' // eslint-disable-line
import RestController, { parseQuery } from 'stein-orm-rest'
import { createAuthMiddleware } from 'fl-auth-server'
import TestModel from '../../models/TestModel'


const whitelist = TestModel.schema.columns()

export function canAccessAsync(options) {
  const {user, req} = options
  if (user && user.admin) return true

  // Don't allow inclusion of related models by default
  const query = parseQuery(req.query)
  if (query.$include) return callback(null, false, 'No $include')

  if (req.method === 'GET') return true

  // Check if the current user is authorised to edit this model here

  return true
}

export default class TestModelsController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      modelType: TestModel,
      route: '/api/test_models',
      auth: [...options.auth, createAuthMiddleware({canAccessAsync})],
      templates: {
        base: require('../templates/testModels/base'),
      },
      defaultTemplate: 'base',
      whitelist: {
        create: whitelist,
        update: whitelist,
      },
    }, options))
  }
}
