/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import express from 'express'
import { createModel, Model } from 'stein-orm'
import Fabricator from '../../stein-orm-tests/src/Fabricator'
import RestController from '../src'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
  Store: require('stein-orm-sql'),
  url: `${DATABASE_URL}/flats`,
  schema: {
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
  },
}


const BASE_COUNT = 10

describe('RestController', () => {
  let Flat = null

  beforeAll(async () => {
    Flat = createModel(options)(class Flat extends Model {})
  })

  // Increase timeout for all tests
  jest.setTimeout(30000)

  beforeEach(() => {
    return Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
      updatedDate: Fabricator.date,
    })
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

  it('can create a controller', async () => {

    class FlatController extends RestController {
      constructor(options) {
        super(options.app, _.defaults({
          modelType: Flat,
          route: '/api/flats',
        }, options))
      }
    }

    expect(FlatController).toBeTruthy()
  })

  it('can trigger an event', async () => {

    class FlatController extends RestController {
      constructor(options) {
        super(options.app, _.defaults({
          modelType: Flat,
          route: '/api/flats',
        }, options))
      }
    }

    const spy = jest.fn(info => console.log(info))

    const app = express()
    const fc = new FlatController({app})
    fc.events.on('__testevent', spy)
    fc.__testEmit()

    expect(spy).toHaveBeenCalled()

  })

})
