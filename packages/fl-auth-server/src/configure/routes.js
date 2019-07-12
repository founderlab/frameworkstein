import moment from 'moment'
import passport from 'passport'
import { logout, sendError, createToken } from '../lib'

export default function configureRoutes(options={}) {
  const app = options.app
  const User = options.User
  if (!app) throw new Error(`[fl-auth] Missing app from configureRoutes, got ${options}`)

  // login via ajax
  app.post(options.paths.login, (req, res, next) => {

    passport.authenticate('password', (err, user, info) => {
      if (err) return sendError(res, err)
      if (!user) return res.status(401).json({error: info})

      req.login(user, {}, err => {
        if (err) return sendError(res, err)

        // Send a http redirect if not an ajax request
        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
          return res.redirect(req.query.returnTo || req.body.returnTo || '/')
        }

        const { accessToken } = info
        return res.json({
          accessToken,
          user,
        })
      })
    })(req, res, next)
  })

  // register via ajax
  app.post(options.paths.register, (req, res, next) => {

    passport.authenticate('register', (err, user, info) => {
      if (err) return sendError(res, err)
      if (!user) return res.status(402).json({error: info})

      req.login(user, {}, err => {
        if (err) return sendError(res, err)

        const { accessToken } = info
        return res.json({
          accessToken,
          user,
        })
      })
    })(req, res, next)
  })

  // perform password reset
  app.post(options.paths.reset, (req, res, next) => {

    passport.authenticate('reset', (err, user, info) => {
      if (err) return sendError(res, err)
      if (!user) return res.status(402).json({error: info})

      req.login(user, {}, err => {
        if (err) return sendError(res, err)

        const { accessToken } = info
        return res.json({
          accessToken,
          user,
        })
      })
    })(req, res, next)
  })

  // request a reset token to be emailed to a user
  app.post(options.paths.resetRequest, (req, res) => {
    const email = req.body.email
    if (!email) return res.status(400).send({error: 'No email provided'})

    User.findOne({email}, (err, user) => {
      if (err) return sendError(res, err)
      if (!user) return res.status(402).json({error: 'User not found'})

      user.save({resetToken: createToken(), resetTokenCreatedDate: moment.utc().toDate()}, err => {
        if (err) return sendError(res, err)

        options.sendResetEmail(user, err => {
          if (err) return sendError(res, err)
          res.status(200).send({})
        })
      })
    })
  })

  // confirm a user's email address
  app.post(options.paths.confirm, (req, res) => {
    const { email, token } = req.body
    if (!email) return res.status(400).send({error: 'No email provided'})
    if (!token) return res.status(400).send({error: 'No email confirmation token provided'})

    User.findOne({email, emailConfirmationToken: token}, (err, user) => {
      if (err) return sendError(res, err)

      if (!user) {
        return User.exists({email, emailConfirmedDate: {$lt: moment.utc().toDate()}}, (err, exists) => {
          if (err) return sendError(res, err)
          if (!exists) res.status(402).json({error: 'User not found or token is invalid'})
          res.status(200).send({})
        })
      }

      user.save({emailConfirmationToken: null, emailConfirmedDate: moment.utc().toDate()}, err => {
        if (err) return sendError(res, err)
        res.status(200).send({})
      })
    })
  })

  // logout
  app.all(options.paths.logout, (req, res) => {
    logout(req, () => res.redirect(req.query.returnTo || '/'))
  })

  // status
  app.get(options.paths.loginStatus, (req, res) => {
    const user = req.user ? {id: req.user.id} : null
    res.json({user})
  })

  if (options.facebook) {
    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at options.paths.facebook_callback
    app.get(options.facebook.paths.redirect, options.facebook.beforeRedirect, passport.authenticate('facebook', {scope: options.facebook.scope}))

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get(options.facebook.paths.callback, passport.authenticate('facebook', {successRedirect: options.facebook.paths.success, failureRedirect: options.facebook.paths.failure}))

    app.post(options.facebook.paths.mobile, (req, res, next) => {
      passport.authenticate('facebookMobile', (err, user, info) => {
        if (err) return sendError(res, err)
        if (!user) return res.status(402).json({error: info})

        req.login(user, {}, err => {
          if (err) return sendError(res, err)

          const { accessToken } = info
          return res.json({
            accessToken,
            user,
          })
        })
      })(req, res, next)
    })
  }

  if (options.linkedIn) {
    app.get(options.linkedIn.paths.redirect, options.linkedIn.beforeRedirect, passport.authenticate('linkedin'))
    app.get(options.linkedIn.paths.callback, passport.authenticate('linkedin', {successRedirect: options.linkedIn.paths.success, failureRedirect: options.linkedIn.paths.failure}))
  }
}
