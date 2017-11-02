
export function validateEmailPass(data) {
  const errors = {}
  if (data.email && !data.email.match(/.+@.+/)) errors.email = 'please enter an email address'
  // if (!data.password || data.password.length < 6) errors.password = '6 characters min for your password'
  return errors
}

export default {validateEmailPass}
