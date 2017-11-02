import _ from 'lodash'

const defaults = {
  unauthorisedMessage: 'Unauthorised',
}

export default function createAuthMiddleware(options) {
  _.merge(options, defaults)
  if (!options.canAccess) throw new Error(`[fl-auth] createAuthMiddleware: Missing options.canAccess. Got options: ${JSON.stringify(options)}`)

  return function authorised(req, res, next) {
    options.canAccess({user: req.user, req, res}, (err, authorised, message) => {
      if (err) return res.status(500).send({error: err})
      if (!authorised) return res.status(401).send({error: message || options.unauthorisedMessage})
      next()
    })
  }
}
