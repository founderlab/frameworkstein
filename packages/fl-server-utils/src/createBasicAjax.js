import request from 'superagent'

// Implement ajax requests with superagent so that models using backbone-http can get their data when
// rendering on the server
export default function createBasicAjax(config) {
  return function basicAjax(options) {
    if (options.url.match(/^\//)) options.url = (config.internalUrl || 'http://localhost') + options.url

    const req = request(options.type, options.url)
    if (options.query) req.query(options.query)

    req.query({$auth_secret: config.secret})

    req.end((err, res) => {
      if ((err || !res.ok) && options.error) return options.error(res || err)
      options.success(res.body)
    })
  }
}
