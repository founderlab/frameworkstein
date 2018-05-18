
export function validateEmailPass(data) {
  const errors = {}
  if (!data.email || !data.email.match(/.+@.+/)) errors.email = 'Please enter an email address'
  if (!data.password || (data.password.length < 6 || data.password.length > 128)) errors.password = 'Passwords should be 6-128 characters'
  return errors
}
