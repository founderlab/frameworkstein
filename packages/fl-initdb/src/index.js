import _ from 'lodash'
import Queue from 'queue-async'
import {directoryFunctionModules} from 'fl-server-utils'

export default (options, callback) => {
  const {User, databaseUrl, modelsDir, scaffold} = options
  if (!User) return console.error('[fl-initdb] Missing User from options')
  if (!databaseUrl) return console.error('[fl-initdb] Missing databaseUrl from options')
  if (!modelsDir) return console.error('[fl-initdb] Missing modelsDir from options')
  if (!scaffold) return console.error('[fl-initdb] Missing scaffold from options')

  const queue = new Queue(1)
  let models

  // Create the database if we're using postgres
  if (databaseUrl.split(':')[0] === 'postgres') {

    queue.defer(callback => {
      const pg = require('pg')
      const split = databaseUrl.split('/')
      const databaseName = split[split.length-1]
      const connectionString = databaseUrl.replace(databaseName, 'postgres')

      pg.connect(connectionString, (err, client, done) => {
        if (err) return console.error('error connecting to postgres db', err)

        client.query(`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${databaseName}')`, (err, result) => {
          if (err || result && result.rowCount > 0) return callback(err)

          console.log('[fl-initdb] Database doesn\'t, exist, creating', databaseName)
          const query = `CREATE DATABASE "${databaseName}"`
          client.query(query, err => {
            done()
            if (err) console.error('error creating database with query:', query, 'error:', err)
            callback(err)
          })
        })
      })
    })

    // Ensure each model has columns according to its schema
    const modelTypes = directoryFunctionModules(modelsDir)
    _.forEach(options.modelTypes || options.Models || [], (Model, name) => modelTypes[name] = Model)

    // Clear any existing data (!)
    if (options.__dangerouslyWipeTheEntireDatabase) {
      console.log('[fl-initdb] Resetting database. All data is going boom, I hope you meant to do this!')
      _.forEach(modelTypes, Model => queue.defer(callback => {
        console.log('[fl-initdb] Resetting', Model.name)
        Model.db().resetSchema(callback)
      }))
    }
    else {
      _.forEach(modelTypes, Model => queue.defer(callback => {
        options.verbose && console.log('[fl-initdb] Ensuring schema for', Model.name)
        Model.db().ensureSchema(callback)
      }))
    }

  }

  // If we don't have an admin user run the scaffold script for this environment
  queue.defer(callback => {
    User.exists({admin: true}, (err, exists) => {
      if (err || exists) return callback(err)

      console.log(`[fl-initdb] No admin user exists. Running scaffold script for env ${process.env.NODE_ENV}`)
      try {
        scaffold((err, _models) => callback(err, models = _models))
      }
      catch (err) {
        console.log('Error scaffolding:', err)
        return callback(err)
      }
    })
  })

  queue.await(err => callback(err, models))
}
