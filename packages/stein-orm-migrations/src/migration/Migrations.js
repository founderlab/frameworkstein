import fs from 'fs'
import path from 'path'

import MigrationExector from './Migration'
import MigrationModel from '../models/Migration'

export default class Migrations {
  constructor(configuration) {
    this.path = configuration.path
    this.pattern = configuration.pattern ? new RegExp(configuration.pattern) : new RegExp('.js$')
  }

  migrationPromise = (directory, filename, results) =>
    new Promise((resolve, reject) => {
      // ensure that the table has been created
      MigrationModel.db().ensureSchema(err => {
        if (err) return reject(err)

        // check to see if this migration has already been run
        MigrationModel.findOne({name: filename}, (err, data) => {
          if (err) return reject(err)
          if (data) {
            // this migration has already been run
            return resolve(results)
          }

          // perform the migration
          const migrationPath = path.resolve(directory, filename)
          const migrationExector = new MigrationExector({path: migrationPath})
          migrationExector.up((err) => {
            if (err) return reject(err)

            // create a new entry in the db to keep track of the executed migration
            const migrationModel = new MigrationModel({name: filename})
            migrationModel.save((err, data) => {
              if (err) return reject(err)
              results.push(data)
              resolve(results)
            })
          })
        })
      })
    })

  up = (callback) => {
    // sort the file list to ensure we are executing migrations in order
    const fileList = fs.readdirSync(this.path).filter((filename) => this.pattern.test(filename)).sort()
    let promiseChain = Promise.resolve([])

    fileList.forEach(filename => {
      promiseChain = promiseChain.then((results) => {
        return this.migrationPromise(this.path, filename, results)
      })
    })

    promiseChain.then(results => callback(null, results)).catch(error => callback(error))
  }

  reset = (callback) => {
    MigrationModel.db().resetSchema(callback)
  }
}
