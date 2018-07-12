/* eslint-env node, jest */

import path from 'path'

import Migration from '../src/migration/Migration'
import { Migrations } from '../src'
import TestModel from './models/TestModel'
import MigrationModel from '../src/models/Migration'

const resetSchema = (Model) => new Promise((resolve, reject) => {
  Model.store.db().resetSchema((err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

const ensureSchema = (Model) => new Promise((resolve, reject) => {
  Model.store.db().ensureSchema((err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

const modelSave = (model) => new Promise((resolve, reject) => {
  model.save((err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

const modelFind = (Model, query) => new Promise((resolve, reject) => {
  Model.find(query, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

const up = (migration) => new Promise((resolve, reject) => {
  migration.up((err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

const reset = (migration) => new Promise((resolve, reject) => {
  migration.reset((err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

beforeEach(async () => {
  await resetSchema(TestModel)
  await resetSchema(MigrationModel)
  await ensureSchema(TestModel)
})

afterAll(async () => {
  await resetSchema(TestModel)
  await resetSchema(MigrationModel)
})

describe('Migrations Tests', async () => {
  test('should execute a single migration', async () => {
    const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
    await modelSave(model)

    // ensure the database is how we expect
    const storedModelsBefore = await modelFind(TestModel, {})
    expect(storedModelsBefore.length).toBe(1)
    expect(storedModelsBefore[0].data.myIntegerField).toBe(777)
    expect(storedModelsBefore[0].data.myTextField).toBe('blah')

    // execute the migrations and retest
    const migration = new Migration({path: path.resolve(__dirname, 'migrations/A_migration')})
    await (up(migration))
    const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter.length).toBe(3)
    expect(storedModelsAfter[0].data.myIntegerField).toBe(777)
    expect(storedModelsAfter[1].data.myIntegerField).toBe(111)
    expect(storedModelsAfter[1].data.myTextField).toBe('blah1')
    expect(storedModelsAfter[2].data.myIntegerField).toBe(222)
    expect(storedModelsAfter[2].data.myTextField).toBe('blah2')
  })

  test('should execute the one migration in the directory', async () => {
    const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
    await modelSave(model)

    // ensure the database is how we expect
    const storedModelsBefore = await modelFind(TestModel, {})
    expect(storedModelsBefore.length).toBe(1)
    expect(storedModelsBefore[0].data.myIntegerField).toBe(777)
    expect(storedModelsBefore[0].data.myTextField).toBe('blah')

    // execute the migrations and retest
    const migrations = new Migrations({path: path.resolve(__dirname, 'migrations')})
    await (up(migrations))
    const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter.length).toBe(3)
    expect(storedModelsAfter[0].data.myIntegerField).toBe(777)
    expect(storedModelsAfter[1].data.myIntegerField).toBe(111)
    expect(storedModelsAfter[1].data.myTextField).toBe('blah1')
    expect(storedModelsAfter[2].data.myIntegerField).toBe(222)
    expect(storedModelsAfter[2].data.myTextField).toBe('blah2')
  })

  test('should execute the all migrations in the directory', async () => {
    const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
    await modelSave(model)

    // ensure the database is how we expect
    const storedModelsBefore = await modelFind(TestModel, {})
    expect(storedModelsBefore.length).toBe(1)
    expect(storedModelsBefore[0].data.myIntegerField).toBe(777)
    expect(storedModelsBefore[0].data.myTextField).toBe('blah')

    // execute the migrations and retest
    const migrations = new Migrations({path: path.resolve(__dirname, 'migrationsMultiple')})
    await up(migrations)
    const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter.length).toBe(5)
    expect(storedModelsAfter[0].data.myIntegerField).toBe(777)
    expect(storedModelsAfter[1].data.myIntegerField).toBe(111)
    expect(storedModelsAfter[1].data.myTextField).toBe('blah1')
    expect(storedModelsAfter[2].data.myIntegerField).toBe(222)
    expect(storedModelsAfter[2].data.myTextField).toBe('blah2')
    expect(storedModelsAfter[3].data.myIntegerField).toBe(333)
    expect(storedModelsAfter[3].data.myTextField).toBe('blah3')
    expect(storedModelsAfter[4].data.myIntegerField).toBe(444)
    expect(storedModelsAfter[4].data.myTextField).toBe('blah4')
  })

  test('should reset all migrations', async () => {
    // execute the migrations
    const migrations = new Migrations({path: path.resolve(__dirname, 'migrationsMultiple')})
    await up(migrations)
    const storedModelsBefore = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsBefore.length).toBe(4)
    expect(storedModelsBefore[0].data.myIntegerField).toBe(111)
    expect(storedModelsBefore[0].data.myTextField).toBe('blah1')
    expect(storedModelsBefore[1].data.myIntegerField).toBe(222)
    expect(storedModelsBefore[1].data.myTextField).toBe('blah2')
    expect(storedModelsBefore[2].data.myIntegerField).toBe(333)
    expect(storedModelsBefore[2].data.myTextField).toBe('blah3')
    expect(storedModelsBefore[3].data.myIntegerField).toBe(444)
    expect(storedModelsBefore[3].data.myTextField).toBe('blah4')

    // reset the schemad
    await reset(migrations)
    await resetSchema(TestModel)

    await up(migrations)
    const storedModelsAfter = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter.length).toBe(4)
    expect(storedModelsAfter[0].data.myIntegerField).toBe(111)
    expect(storedModelsAfter[0].data.myTextField).toBe('blah1')
    expect(storedModelsAfter[1].data.myIntegerField).toBe(222)
    expect(storedModelsAfter[1].data.myTextField).toBe('blah2')
    expect(storedModelsAfter[2].data.myIntegerField).toBe(333)
    expect(storedModelsAfter[2].data.myTextField).toBe('blah3')
    expect(storedModelsAfter[3].data.myIntegerField).toBe(444)
    expect(storedModelsAfter[3].data.myTextField).toBe('blah4')

  })

  test('should be able to tell which migrations have been run', async () => {
    const model = new TestModel({myTextField: 'blah', myIntegerField: 777})
    await modelSave(model)

    // ensure the database is how we expect
    const storedModelsBefore = await modelFind(TestModel, {})
    expect(storedModelsBefore.length).toBe(1)
    expect(storedModelsBefore[0].data.myIntegerField).toBe(777)
    expect(storedModelsBefore[0].data.myTextField).toBe('blah')

    // execute the migrations and retest
    const migrations = new Migrations({path: path.resolve(__dirname, 'migrations')})
    await up(migrations)
    const storedModelsAfter1 = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter1.length).toBe(3)
    expect(storedModelsAfter1[0].data.myIntegerField).toBe(777)
    expect(storedModelsAfter1[1].data.myIntegerField).toBe(111)
    expect(storedModelsAfter1[1].data.myTextField).toBe('blah1')
    expect(storedModelsAfter1[2].data.myIntegerField).toBe(222)
    expect(storedModelsAfter1[2].data.myTextField).toBe('blah2')

    const migrationsMutliple = new Migrations({path: path.resolve(__dirname, 'migrationsMultiple')})
    await up(migrationsMutliple)
    const storedModelsAfter2 = await modelFind(TestModel, {$sort: 'createdDate'})
    expect(storedModelsAfter2.length).toBe(5)
    expect(storedModelsAfter2[0].data.myIntegerField).toBe(777)
    expect(storedModelsAfter2[1].data.myIntegerField).toBe(111)
    expect(storedModelsAfter2[1].data.myTextField).toBe('blah1')
    expect(storedModelsAfter2[2].data.myIntegerField).toBe(222)
    expect(storedModelsAfter2[2].data.myTextField).toBe('blah2')
    expect(storedModelsAfter2[3].data.myIntegerField).toBe(333)
    expect(storedModelsAfter2[3].data.myTextField).toBe('blah3')
    expect(storedModelsAfter2[4].data.myIntegerField).toBe(444)
    expect(storedModelsAfter2[4].data.myTextField).toBe('blah4')
  })

  test('should be able to handle empty migrations folder', async () => {
    const migrationsEmpty = new Migrations({path: path.resolve(__dirname, 'migrationsEmpty')})
    await up(migrationsEmpty)
  })
})
