import _ from 'lodash'

const defaults = {
  unauthorisedMessage: 'Unauthorised',
}

export default function createAuthMiddleware(options) {
  _.merge(options, defaults)
  if (!options.canAccess && !options.canAccessAsync) throw new Error(`[fl-auth] createAuthMiddleware: Missing options.canAccess. Got options: ${JSON.stringify(options)}`)

  return async function authorised(req, res, next) {
    try {
      const done = (err, authorised, message) => {
        if (err) return res.status(500).send({error: err})
        if (!authorised) return res.status(401).send({error: message || options.unauthorisedMessage})
        next()
      }

      if (options.canAccess) return options.canAccess({user: req.user, req, res}, done)

      // Result may be a boolean indicating success or an object containing err, authorised, message
      const result = await options.canAccessAsync({user: req.user, req, res})

      if (!result || _.isBoolean(result)) return done(null, !!result)
      const {err, authorised, message} = result
      done(err, authorised, message)
    }
    catch (err) {
      res.status(500).send({error: err})
    }
  }
}
