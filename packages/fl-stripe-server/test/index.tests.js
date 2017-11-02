import _ from 'lodash'
import assert from 'assert'
import {spy} from 'sinon'
import {createStripeController, createStripeCustomer} from '../src'
import User from './User'

const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const StripeCustomer = createStripeCustomer(User)

const user = new User({email: 'a@b.co'})
let expectedCardCount = 0

function createApp() {
  return {
    get: spy(),
    put: spy(),
    post: spy(),
    delete: spy(),
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
  return {
    status: spy(),
    send: spy(),
    json: jsonFn,
  }
}

function createOptions() {
  return {
    User,
    app: createApp(),
  }
}

describe('StripeController', () => {

  before(done => {
    StripeCustomer.resetSchema(() => User.resetSchema(() => user.save(done)))
  })

  it('Creates the stripe controller', done => {
    createStripeController(createOptions())
    done()
  })

  it('Can create a customer without a token', done => {
    const {createCard} = createStripeController(createOptions())

    createCard(createReq(), createRes(json => {
      assert.ok(json)

      StripeCustomer.cursor({user_id: user.id}).toJSON((err, custs) => {
        assert.ifError(err)
        assert.ok(custs)
        assert.equal(custs.length, 1)
        done()
      })
    }))
  })

  it('Can add a card using a token', done => {
    const {createCard} = createStripeController(createOptions())

    stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '2030',
        cvc: '123',
      },
    }, (err, token) => {
      createCard(createReq({}, {token: token.id}), createRes(json => {
        assert.ok(json)
        expectedCardCount = 1
        done()
      }))
    })
  })

  it('Can add another card using a token', done => {
    const {createCard} = createStripeController(createOptions())

    stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: '10',
        exp_year: '2030',
        cvc: '321',
      },
    }, (err, token) => {
      createCard(createReq({}, {token: token.id}), createRes(json => {
        assert.ok(json)
        expectedCardCount = 2
        done()
      }))
    })
  })

  it('Can list a users cards', done => {
    const {listCards} = createStripeController(createOptions())

    listCards(createReq(), createRes(json => {
      assert.ok(json)
      assert.equal(json.length, expectedCardCount)
      done()
    }))

  })

  it('Can change the default card', done => {
    const {listCards, setDefaultCard} = createStripeController(createOptions())

    listCards(createReq(), createRes(json => {
      assert.ok(json)
      assert.equal(json.length, expectedCardCount)

      const id = json[0].id
      const req = createReq({}, {}, {id})
      const res = createRes(json => {
        assert.ok(json)
        assert.ifError(res.status.called)

        listCards(createReq(), createRes(json => {
          assert.ok(json)
          assert.equal(json.length, expectedCardCount)
          const newDefaultCard = _.find(json, c => c.id ===id)
          const notDefaultCard = _.find(json, c => c.id !==id)
          assert.ok(newDefaultCard.default)
          assert.ok(!notDefaultCard.default)
          done()
        }))
      })

      setDefaultCard(req, res)
    }))
  })

  it('Can delete a card', done => {
    const {listCards, deleteCard} = createStripeController(createOptions())

    listCards(createReq(), createRes(json => {
      assert.ok(json)
      assert.equal(json.length, expectedCardCount)

      const id = json[0].id
      const req = createReq({}, {}, {id})
      const res = createRes(json => {
        assert.ok(json)
        assert.ifError(res.status.called)
        expectedCardCount = 1

        listCards(createReq(), createRes(json => {
          assert.ok(json)
          assert.equal(json.length, expectedCardCount)
          done()
        }))
      })

      deleteCard(req, res)
    }))
  })

  it('Can charge a customer', done => {
    const {chargeCustomer} = createStripeController(createOptions())

    chargeCustomer(createReq({}, {amount: 3000, user_id: user.id}), createRes(json => {
      assert.ok(json)
      assert.ok(json.ok)
      done()
    }))
  })

})
