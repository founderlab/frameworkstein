import _ from 'lodash'
import URL from 'url'

const SUPPORTED_KEYS = ['protocol', 'slashes', 'auth', 'host', 'hostname', 'port', 'search', 'query', 'hash', 'href']

export default class DatabaseUrl {

  // Create an instance. Arguments follow the convention of node url
  constructor(url, parseQueryString, slashesDenoteHost) {
    let database,
      key
    const urlParts = URL.parse(url, parseQueryString, slashesDenoteHost)

    // multiple, comma-delimited databases
    const parts = urlParts.pathname.split(',')
    if (parts.length > 1) {
      const startParts = _.pick(urlParts, 'protocol', 'auth', 'slashes')
      startParts.host = '{1}'; startParts.pathname = '{2}'
      let startUrl = URL.format(startParts)
      startUrl = startUrl.replace('{1}/{2}', '')

      const pathPaths = urlParts.pathname.split('/')
      urlParts.pathname = `/${pathPaths[pathPaths.length-2]}/${pathPaths[pathPaths.length-1]}`

      let databasesString = url.replace(startUrl, '')
      databasesString = databasesString.substring(0, databasesString.indexOf(urlParts.pathname))
      const databases = databasesString.split(',')

      for (key of ['host', 'hostname', 'port']) { delete urlParts[key] }
      this.hosts = []
      for (database of Array.from(databases)) {
        const host = database.split(':')
        this.hosts.push(host.length === 1 ? {host: host[0], hostname: host[0]} : {host: host[0], hostname: `${host[0]}:${host[1]}`, port: host[1]})
      }
    }

    const databaseParts = _.compact(urlParts.pathname.split('/'))
    this.table = databaseParts.pop()
    this.database = databaseParts.join('/')
    if (urlParts.protocol && urlParts.protocol.endsWith(':')) {
      urlParts.protocol = urlParts.protocol.slice(0, -1)
    }
    for (key of Array.from(SUPPORTED_KEYS)) { if (urlParts.hasOwnProperty(key)) { this[key] = urlParts[key] } }
  }

  format(options) {
    if (options == null) { options = {} }
    const urlParts = _.pick(this, SUPPORTED_KEYS)
    urlParts.pathname = ''

    // array of hosts
    if (this.hosts) {
      const hostStrings = _.map(this.hosts, host => `${host.host}${host.port ? `:${host.port}` : ''}`)
      urlParts.pathname += hostStrings.join(',')
      urlParts.host = '{1}'
    }

    if (this.database) { urlParts.pathname += `/${this.database}` }
    if (this.table && !options.excludeTable) { urlParts.pathname += `/${this.table}` }
    if (options.exclude_search || options.excludeQuery) { delete urlParts.search; delete urlParts.query }
    let url = URL.format(urlParts)
    if (this.hosts) { url = url.replace(`{1}/${urlParts.pathname}`, urlParts.pathname) }
    return url
  }

  parseAuth() {
    if (!this.auth) { return null }
    const authParts = this.auth.split(':')
    const result = {user: authParts[0]}
    result.password = authParts.length > 1 ? authParts[1] : null
    return result
  }
}
