import _ from 'lodash'

export function addCORSHeaders(res, origin) {
  if (origin) res.set('Access-Control-Allow-Origin', origin)
  res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Disposition,Content-Type,Content-Description,Content-Range,X-CSRF-Token,Authorization')
  res.set('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS')
  res.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export default function cors(origin) {
  return (req, res, next) => {
    addCORSHeaders(res, origin)
    if (req.method.toLowerCase() === 'options') return res.status(200).end()
    next()
  }
}

export function allowOrigin(app, paths_, origin) {
  const paths = _.isArray(paths) ? paths_ : [paths_]
  paths.forEach(path => app.all(path, allow(origin)))
}
