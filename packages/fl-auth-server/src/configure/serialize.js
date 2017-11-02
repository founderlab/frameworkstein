import passport from 'passport'

export default function configureSerializing(options={}) {
  const User = options.User
  if (!User) throw new Error(`[fl-auth] Missing User model from configureSerializing, got ${options}`)

  // serialize users to their id
  passport.serializeUser(options.serializing.serializeUser)
  passport.deserializeUser(options.serializing.deserializeUser)
}
