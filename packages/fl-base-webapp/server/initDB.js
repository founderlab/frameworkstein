import path from 'path'
import initdb from 'fl-initdb'
import { Migrations } from 'stein-orm-migrations'

const migrations = new Migrations({path: path.resolve(__dirname, '../scaffold/migrations')})

export default function initDB(callback) {
  if (process.env.SKIP_INIT_DB) return callback()
  initdb({
    User: require('./models/User'),
    modelTypes: [require('fl-auth-server').AccessToken, require('fl-auth-server').RefreshToken],
    databaseUrl: process.env.DATABASE_URL,
    modelsDir: path.resolve(__dirname, './models'),
    scaffold: require(`../scaffold/${process.env.NODE_ENV}`),
    __dangerouslyWipeTheEntireDatabase: process.env.DANGEROUSLY_WIPE_DB_CRAZY_MAN === 'yesplease',
  }, (err, models) => {
    if (err) {
      console.error('Error initialising database:', err)
      return callback(err, models)
    }
    return callback()

    // if (process.env.DANGEROUSLY_WIPE_DB_CRAZY_MAN === 'yesplease') {
    //   // undo all of the migrations
    //   migrations.reset((err) => {
    //     if (err) console.error('Error resetting migrations:', err)
    //     // execute migrations
    //     migrations.up((err) => {
    //       if (err) console.error('Error executing migrations:', err)
    //       return callback(err, models)
    //     })
    //   })
    // }
    // else {
    //   // no reset needed, execute migrations
    //   migrations.up((err) => {
    //     if (err) console.error('Error executing migrations:', err)
    //     return callback(err, models)
    //   })
    // }
  })
}
