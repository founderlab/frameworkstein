import path from 'path'
import initdb from 'fl-initdb'

export default function testInitDB(callback) {
  if (process.env.NODE_ENV !== 'test') return callback(new Error('Only run testInitDB with NODE_ENV === test'))
  initdb({
    User: require('../server/models/User'),
    modelTypes: [require('fl-auth-server').AccessToken, require('fl-auth-server').RefreshToken],
    databaseUrl: process.env.DATABASE_URL,
    modelsDir: path.resolve(__dirname, '../server/models'),
    scaffold: require(`../scaffold/${process.env.NODE_ENV}`),
    __dangerouslyWipeTheEntireDatabase: process.env.NO_RESET ? false : true,
  }, (err, models) => {
    if (err) console.trace('Error initialising database:', err)
    callback(err, models)
  })
}
