import passport from 'passport'

export default function sessionOrToken(req, res, next) {
  if (req.isAuthenticated()) return next()

  passport.authenticate('bearer', {session: false}, (err, user) => {
    if (err) return res.status(500).send({error: err})
    if (!user) return next()

    req.login(user, {}, err => {
      if (err) return res.status(500).send({error: err})
      next()
    })

  })(req, res, next)
}

//todo: refresh token
