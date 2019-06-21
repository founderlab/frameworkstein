import _ from 'lodash' // eslint-disable-line
import RestController, { parseQuery } from 'stein-orm-rest'
import {createAuthMiddleware} from 'fl-auth-server'
import schema from '../../../shared/models/schemas/post'
import Post from '../../models/Post'


const whitelist = [...Post.schema.columns()]

export function canAccessAsync(options) {
  const {user, req} = options
  if (user && user.admin) return true

  // Don't allow inclusion of related models by default
  const query = parseQuery(req.query)
  if (query.$include) return {authorised: false, message: 'No $include'}

  if (req.method === 'GET') return true

  // Check if the current user is authorised to edit this model here
  // Defaults to unrestricted access
  return true
}


export default class PostsController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      modelType: Post,
      route: '/api/posts',
      auth: [...options.auth, createAuthMiddleware({canAccessAsync})],
      templates: {
        base: require('../templates/posts/base'),
      },
      defaultTemplate: 'base',
      whitelist: {
        create: whitelist,
        update: whitelist,
      },
    }, options))
  }
}
