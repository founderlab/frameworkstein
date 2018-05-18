// require('pretty-error').start()
import morgan, {compile} from 'morgan'
import config from './config'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

// aws using rds
if (!process.env.DATABASE_URL) {
  console.log('No DATABASE_URL found, using RDS')
  const db = {
    user: process.env.RDS_USERNAME,
    pass: process.env.RDS_PASSWORD,
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    name: `${config.name}_${process.env.NODE_ENV}`,
  }
  process.env.DATABASE_URL = `postgres://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`
  console.log('process.env.DATABASE_URL set to', process.env.DATABASE_URL)
}

// no jQuery, backbone needs an ajax function
const Backbone = require('backbone')
Backbone.ajax = require('fl-server-utils').createBasicAjax(config)

morgan.token('subdomain', req => req.headers.host ? req.headers.host.split('.')[0] : '~')

// Modified morgan dev format so we can have colours
morgan.format('fl', function developmentFormatLine(tokens, req, res) {
  // get the status code if response written
  const status = res._header ? res.statusCode : undefined

  // get status colour
  let colour = 0
  if (status >= 500) colour = 31 // red
  else if (status >= 400) colour = 33 // yellow
  else if (status >= 300) colour = 36 // cyan
  else if (status >= 200) colour = 32 // green

  // get coloured function
  let fn = developmentFormatLine[colour]

  if (!fn) {
    // compile
    fn = developmentFormatLine[colour] = compile('\x1b['
      + colour + 'm:method :status \x1b[0m:subdomain :url :response-time ms - :res[content-length]\x1b[0m :res[hostname] :remote-addr :date')
  }

  return fn(tokens, req, res)
})
