/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import express from 'express'
import { createModel, Model } from 'stein-orm'
import Fabricator from 'stein-orm/src/lib/Fabricator'
import RestController from '../src'


const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) console.log('Missing DATABASE_URL')

const options = {
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

  beforeEach(async () => {
    Flat = createModel(options)(class Flat extends Model {})
    await Flat.store.resetSchema({verbose: process.env.VERBOSE})

    return Fabricator.create(Flat, BASE_COUNT, {
      name: Fabricator.uniqueId('flat_'),
      createdDate: Fabricator.date,
      updatedDate: Fabricator.date,
    })
  })

  afterAll(() => Flat.store.disconnect())

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
