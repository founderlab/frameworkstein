
export default options =>
`import _ from 'lodash' // eslint-disable-line
import RestController, { parseQuery } from 'stein-orm-rest'
import {createAuthMiddleware} from 'fl-auth-server'
import schema from '../../../shared/models/schemas/${options.variableName}'
import ${options.className} from '../../models/${options.className}'


const whitelist = [
  'id',
  ..._.keys(schema),
]

export function canAccess(options, callback) {
  const {user, req} = options
  if (user && user.admin) return callback(null, true)

  // Don't allow inclusion of related models by default
  const query = parseQuery(req.query)
  if (query.$include) return callback(null, false, 'No $include')

  if (req.method === 'GET') return callback(null, true)

  // Check if the current user is authorised to edit this model here

  callback(null, false)
}

export default class ${options.classPlural}Controller extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      modelType: ${options.className},
      route: '/api/${options.tableName}',
      auth: [...options.auth, createAuthMiddleware({canAccess})],
      templates: {
        base: require('../templates/${options.variablePlural}/base'),
      },
      default_template: 'base',
      whitelist: {
        create: whitelist,
        update: whitelist,
      },
    }, options))
  }
}
`
