import passport from 'passport'

export default function configureMiddleware(options={}) {
  const app = options.app
  if (!app) throw new Error(`[fl-auth] Missing app from configureMiddleware, got ${options}`)

  if (options.middleware.initialize) app.use(passport.initialize())
  if (options.middleware.session) app.use(passport.session())
}
