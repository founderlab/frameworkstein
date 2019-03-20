/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import express from 'express'
import { createModel, Model } from 'stein-orm'
import Fabricator from 'stein-orm/src/lib/Fabricator'
import request from 'supertest'
import RestController from '../src'


const sortedIds = models => _.map(_.sortBy(models, 'id'), 'id')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
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

  afterAll(() => Flat.store.disconnect())

  describe('index', () => {

    it('should return json for all models with no query', (done) => {
      const app = express()
      const route = '/api/flats'
      const controller = new RestController(app, {route, modelType: Flat})

      return request(app)
        .get(route)
        .type('json')
        .end((err, res) => {
          expect(err).toBeFalsy()
          expect(res.status).toBe(200)
          expect(sortedIds(res.json)).toEqual(sortedIds(models))
          return done()
        })
    })

  })
})
