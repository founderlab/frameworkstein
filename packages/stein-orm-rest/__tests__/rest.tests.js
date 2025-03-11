/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import express from 'express'
import { createModel, Model } from 'stein-orm'
import request from 'supertest'
import Fabricator from '../../stein-orm-tests/src/Fabricator'
import RestController from '../src'


const sortedIds = models => _.map(_.sortBy(models, 'id'), 'id')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  Store: require('stein-orm-sql'),
  url: `${DATABASE_URL}/flats`,
  schema: {
    name: 'Text',
    boolean: 'Boolean',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
  },
}

let models = null
const BASE_COUNT = 10

describe('RestController', () => {
  let Flat = null

  // Increase timeout for all tests
  jest.setTimeout(30000)

  beforeAll(async () => {
    Flat = createModel(options)(class Flat extends Model {})
  })

  beforeEach(async () => {
    await Flat.store.resetSchema({verbose: process.env.VERBOSE})

    await Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
      updatedDate: Fabricator.date,
    })

    models = Flat.cursor().toJSON()
  })

  afterAll(async () => {
    try {
      // Skip disconnection for now to avoid timeout issues
      // await Flat.store.disconnect()
      console.log('Skipping database disconnection to avoid timeout issues')
    }
    catch (err) {
      console.error('Error disconnecting from store:', err)
    }
  })

  describe('index', () => {

    it('should return json for all models with no query', (done) => {
      const app = express()
      const route = '/api/flats'
      const controller = new RestController(app, {route, modelType: Flat})

      request(app)
        .get(route)
        .type('json')
        .end((err, res) => {
          expect(err).toBeFalsy()
          expect(res.status).toBe(200)
          expect(sortedIds(res.json)).toEqual(sortedIds(models))
          done()
        })
    })

  })

  describe('timing', () => {
    it('should call the timing callback with timing data', (done) => {
      const app = express()
      const route = '/api/flats'
      let timingData = null

      // Create a mock timing callback
      const timingCallback = jest.fn((data) => {
        timingData = data
      })

      // Create controller with timing enabled
      const controller = new RestController(app, {
        route,
        modelType: Flat,
        enableTiming: true,
        timingCallback,
      })

      request(app)
        .get(route)
        .type('json')
        .end((err, res) => {
          expect(err).toBeFalsy()
          expect(res.status).toBe(200)

          // Verify the callback was called
          expect(timingCallback).toHaveBeenCalled()

          // Verify timing data structure
          expect(timingData).toBeTruthy()
          expect(timingData.route).toBe(route)
          expect(timingData.method).toBe('GET')
          expect(timingData.startTime).toBeDefined()
          expect(timingData.endTime).toBeDefined()
          expect(timingData.duration).toBeDefined()
          expect(timingData.sqlQuery).toBeDefined()

          // Verify timing data values
          expect(timingData.duration).toBeGreaterThan(0)
          expect(timingData.endTime).toBeGreaterThan(timingData.startTime)

          done()
        })
    })

    it('should allow setting the timing callback after controller creation', (done) => {
      const app = express()
      const route = '/api/flats'
      let timingData = null

      // Create controller with timing enabled but no callback
      const controller = new RestController(app, {
        route,
        modelType: Flat,
        enableTiming: true,
      })

      // Set the callback after creation
      const timingCallback = jest.fn((data) => {
        timingData = data
      })
      controller.setTimingCallback(timingCallback)

      request(app)
        .get(route)
        .type('json')
        .end((err, res) => {
          expect(err).toBeFalsy()
          expect(res.status).toBe(200)

          // Verify the callback was called
          expect(timingCallback).toHaveBeenCalled()

          // Verify timing data
          expect(timingData).toBeTruthy()
          expect(timingData.route).toBe(route)
          expect(timingData.sqlQuery).toBeDefined()

          done()
        })
    })

    it('should enable timing automatically when timingCallback is provided', (done) => {
      const app = express()
      const route = '/api/flats'
      let timingData = null

      // Create controller with only a timing callback (should enable timing)
      const timingCallback = jest.fn((data) => {
        timingData = data
      })
      const controller = new RestController(app, {
        route,
        modelType: Flat,
        timingCallback,
      })

      request(app)
        .get(route)
        .type('json')
        .end((err, res) => {
          expect(err).toBeFalsy()
          expect(res.status).toBe(200)

          // Verify the callback was called
          expect(timingCallback).toHaveBeenCalled()

          // Verify timing data
          expect(timingData).toBeTruthy()

          done()
        })
    })
  })
})
