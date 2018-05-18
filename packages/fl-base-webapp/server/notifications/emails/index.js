import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import querystring from 'querystring'
import appConfig from '../../config'
import passwordReset from './templates/passwordReset'
import emailConfirmation from './templates/emailConfirmation'

let transport = null

export function configure(config=appConfig) {
  const transportOptions = {
    host: config.email.host,
    port: +config.email.port,
    secureConnection: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
    debug: true,
  }
  transport = nodemailer.createTransport(smtpTransport(transportOptions))
}

// usage:
// sendMail({to: 'a@b.com', subject: 'testsubject', html: 'testemailtext'}, err => { ... } )
export default function sendMail(options, callback) {
  if (!transport) configure()
  if (!options.to) return callback(new Error('sendMail: missing options.to'))
  if (!options.from) options.from = appConfig.email.from

  if (process.env.NODE_ENV !== 'production') options.subject = `[${process.env.NODE_ENV}] ${options.subject}`
  transport.sendMail(options, callback)
}

export function sendConfirmationEmail(user, callback) {
  const email = user.get('email')
  const query = querystring.stringify({email, token: user.get('emailConfirmationToken')})
  const options = {
    confirmationUrl: `${appConfig.url}/confirm-email?${query}`,
  }
  const message = emailConfirmation(options)
  console.log('[email sendConfirmationEmail]', email, options, user.get('emailConfirmationToken'), message)
  sendMail({to: email, subject: `Confirm your email for ${appConfig.url}`, html: message}, callback)
}

export function sendResetEmail(user, callback) {
  const email = user.get('email')
  const query = querystring.stringify({email, resetToken: user.get('resetToken')})
  const options = {
    resetUrl: `${appConfig.url}/reset?${query}`,
  }
  const message = passwordReset(options)
  console.log('[email sendResetEmail]', email, options, user.get('resetToken'), message)
  sendMail({to: email, subject: `Password reset for ${appConfig.url}`, html: message}, callback)
}
