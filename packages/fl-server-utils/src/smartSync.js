import _ from 'lodash'

const SQL_PROTOCOLS = ['mysql', 'mysql2', 'postgres', 'pg', 'sqlite', 'sqlite3']
const HTTP_PROTOCOLS = ['http', 'https']

export function selectModule(dbUrl) {
  if (!dbUrl) {
    console.error('[fl-server-utils] selectModule: No dbUrl provided, got', dbUrl)
    return null
  }

  const protocol = dbUrl.split(':')[0]
  if (protocol === 'mongodb') {
    return 'backbone-mongo'
  }
  else if (_.includes(SQL_PROTOCOLS, protocol)) {
    return 'fl-backbone-sql'
  }
  else if (_.includes(HTTP_PROTOCOLS, protocol) || dbUrl.match(/^\//)) {
    return 'backbone-http'
  }
  return 'backbone-orm'
}

export default function smartSync(dbUrl, Model) {
  if (!dbUrl) {
    console.error('[fl-server-utils] smartSync: No dbUrl provided, got', arguments)
    return null
  }
  return require(selectModule(dbUrl)).sync(Model)
}
