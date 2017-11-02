
export default function createInternalMiddleware(options) {
  const {User, secret, deserializeUser} = options

  if (!(User || deserializeUser)) {
    console.error('[fl-auth] createInternalMiddleware requires a User or deserializeUser option')
    return (req, res, next) => next()
  }

  const getUser = deserializeUser || ((id, callback) => User.cursor({id, $one: true}).toJSON(callback))

  return (req, res, next) => {

    if (!req.query.$auth_secret) return next()
    if (req.query.$auth_secret !== secret) {
      console.error('[fl-auth] createInternalMiddleware: Non-matching $auth_secret supplied on query - ', req.query.$auth_secret)
      return next()
    }
    delete req.query.$auth_secret

    if (!req.query.$user_id) return next()

    let userId
    try {
      userId = JSON.parse(req.query.$user_id)
    }
    catch (err) {
      userId = req.query.$user_id
    }

    getUser(userId, (err, user) => {
      if (err) return res.status(500).send(`[fl-auth] createInternalMiddleware: Error retrieving $user_id ${req.query.$user_id} ${err.message || err}`)
      if (!user) return res.status(500).send(`[fl-auth] createInternalMiddleware: Can't find $user_id ${req.query.$user_id}`)
      req.user = user
      delete req.query.$user_id
      next()
    })
  }
}
