import fs from 'fs'
import path from 'path'
import MigrationModel from '../models/Migration'


async function executeMigration(path) {
  const migration = require(path)
  return migration.up(err => err && console.log('[Migrations.executeMigration] error:', path, err))
}

export default class Migrations {

  constructor(configuration) {
    this.path = configuration.path
    this.pattern = configuration.pattern ? new RegExp(configuration.pattern) : new RegExp('.js$')
  }

  migrate = async (directory, filename) => {
    try {
       // ensure that the table has been created
      await MigrationModel.store.db().ensureSchema()

      // check to see if this migration has already been run
      const existingModel = await MigrationModel.findOne({name: filename})
      if (existingModel) {
        // this migration has already been run
        return existingModel
      }

      // perform the migration
      const migrationPath = path.resolve(directory, filename)
      await executeMigration(migrationPath)

      // create a new entry in the db to keep track of the executed migration
      const migrationModel = new MigrationModel({name: filename})
      await migrationModel.save()

      return migrationModel
    }
    catch (err) {
      console.log('[Migrations] error:', err)
    }
  }

  up = async () => {
    // sort the file list to ensure we are executing migrations in order
    const fileList = fs.readdirSync(this.path).filter((filename) => this.pattern.test(filename)).sort()
    const results = []

    for (const filename of fileList) {
      const res = await this.migrate(this.path, filename)
      if (res) results.push(res)
    }

    return results
  }

  reset = async () => {
    return MigrationModel.store.db().resetSchema(callback)
  }

}
