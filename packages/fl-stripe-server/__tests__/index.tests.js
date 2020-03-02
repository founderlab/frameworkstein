import _ from 'lodash'
import { createStripeController } from '../src'
import User from './models/User'
import StripeCustomer from './models/StripeCustomer'


const stripe = require('stripe')(process.env.STRIPE_API_KEY)

const user = new User({email: 'a@b.co'})
let expectedSourceCount = 0
let controller

function createApp() {
  return {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  }
}

function createReq(query={}, body={}, params={}) {
  return {
    query,
    body,
    params,
    user,
  }
}

function createRes(jsonFn) {
  const res = {
    status: jest.fn(),
    send: jsonFn,
    json: jsonFn,
  }
  res.status.mockReturnValue(res)
  return res
}

function createOptions() {
  return {
    User,
    StripeCustomer,
    app: createApp(),
  }
}

describe('StripeController', () => {

  beforeAll(async () => {
    await StripeCustomer.store.resetSchema()
    await User.store.resetSchema()
    await user.save()
    controller = createStripeController(createOptions())
  })

  it('Can create a customer without a token', done => {
    const { createSource } = controller

    createSource(createReq(), createRes(async json => {
      expect(json).toBeTruthy()

      const custs = await StripeCustomer.cursor({user_id: user.id}).toJSON()
      expect(custs).toBeTruthy()
      expect(custs.length).toBe(1)
      done()
    }))
  })

  it('Can add a source using a token', async done => {
    const { createSource } = controller

    const token = await stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '2030',
        cvc: '123',
      },
    })

    createSource(createReq({}, {token: token.id}), createRes(async json => {
      expect(json).toBeTruthy()
      expectedSourceCount = 1
      done()
    }))
  })

  it('Can add another source using a token', async done => {
    const { createSource } = controller

    const token = await stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: '10',
        exp_year: '2030',
        cvc: '321',
      },
    })
    createSource(createReq({}, {token: token.id}), createRes(async json => {
      expect(json).toBeTruthy()
      expectedSourceCount = 2
      done()
    }))
  })

  it('Can list a users sources', done => {
    const { listSources } = controller

    listSources(createReq(), createRes(async json => {
      expect(json).toBeTruthy()
      expect(json.length).toBe(expectedSourceCount)
      done()
    }))
  })

  it('Can change the default source', done => {
    const { listSources, setDefaultSource } = controller

    listSources(createReq(), createRes(async json => {
      expect(json).toBeTruthy()
      expect(json.length).toBe(expectedSourceCount)

      const sourceId = json[0].id

      setDefaultSource(createReq({}, {sourceId}), createRes(async json => {
        expect(json).toBeTruthy()

        listSources(createReq(), createRes(async json => {
          expect(json).toBeTruthy()
          expect(json.length).toBe(expectedSourceCount)

          const newDefaultSource = _.find(json, c => c.id === sourceId)
          const notDefaultSource = _.find(json, c => c.id !== sourceId)

          expect(newDefaultSource.default).toBeTruthy()
          expect(notDefaultSource.default).toBeFalsy()

          done()
        }))
      }))

    }))
  })

  it('Can delete a source', done => {
    const { listSources, deleteSource } = controller

    listSources(createReq(), createRes(async json => {
      expect(json).toBeTruthy()
      expect(json.length).toBe(expectedSourceCount)

      const sourceId = json[0].id
      const req = createReq({}, {}, {sourceId})
      const res = createRes(async json => {
        expect(json).toBeTruthy()
        expect(res.status.called).toBeFalsy()
        expectedSourceCount = 1

        listSources(createReq(), createRes(async json => {
          expect(json).toBeTruthy()
          expect(json.length).toBe(expectedSourceCount)
          done()
        }))
      })

      deleteSource(req, res)
    }))
  })

  it('Can charge a customer', done => {
    const { chargeCustomer } = controller

    chargeCustomer(createReq({}, {amount: 3000, user_id: user.id}), createRes(async json => {
      expect(json).toBeTruthy()
      expect(json.ok).toBeTruthy()
      done()
    }))
  })

})
