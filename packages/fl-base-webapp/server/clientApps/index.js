import { AccessToken } from 'fl-auth-server'
import admin from './admin'
import app from './app'


export default (options) => {
  if (!options.app) throw new Error('clientApps init: Missing app from options')

  // Check for an expired access token in the session and redirect to login if present
  options.app.use((req, res, next) => {
    if (req.session && req.session.accessToken && req.session.accessToken.token) {
      AccessToken.exists({token: req.session.accessToken.token}, (err, exists) => {
        if (err) return res.status(500).send('Error checking access token')
        if (exists) return next()
        req.session.user = null
        req.session.accessToken = null
        req.session.passport = null
        res.redirect('/login')
      })
    }
    else {
      next()
    }
  })

  options.app.get('/admin*', admin)
  options.app.get('*', app)
}
