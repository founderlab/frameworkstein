import _ from 'lodash'
import createStripe from 'stripe'
import { createAuthMiddleware } from 'fl-auth-server'
import createStripeCustomer from './models/createStripeCustomer'
import {
  createCard,
  listCards,
  deleteCard,
  setDefaultCard,
  chargeCustomer,
  listPlans,
  getCoupon,
  showSubscription,
  subscribeToPlan,
} from './interface'

const defaults = {
  route: '/api/stripe',
  manualAuthorisation: false,
  cardWhitelist: ['id', 'country', 'brand', 'last4'],
  currency: 'aud',
  maxAmount: 500 * 100, // $500
}

function sendError(res, err, msg) {
  console.log('[fl-stripe-server] error:', err)
  res.status(500).send({error: msg || err && err.toString()})
}

export default function createStripeController(_options) {
  const options = _.defaults(_options, defaults)
  const { app, User } = options
  if (!app) return console.error('createStripeController requires an `app` option, got', _options)
  if (!User) return console.error('createStripeController requires a `User` option, got', _options)

  const StripeCustomer = options.StripeCustomer || createStripeCustomer(User)
  const stripe = createStripe(options.apiKey || process.env.STRIPE_API_KEY)

  // Authorisation check. Make sure we can only work with cards (StripeCustomer models) belonging to the logged in user
  function canAccess(options, callback) {
    const { user } = options
    if (!user) return callback(null, false)
    if (user.admin) return callback(null, true)
    // No additional options; use the logged in user id as the context for all interactions wth Stripe
    callback(null, true)
  }

  function handleCreateCard(req, res) {
    const token = req.body.token // obtained with Stripe.js
    const userId = req.user.id

    createCard({stripe, userId, source: token, description: `User ${req.user.email}`, StripeCustomer}, (err, card) => {
      if (err) return sendError(res, err)
      res.json(_.pick(card, options.cardWhitelist))
    })
  }

  function handleListCards(req, res) {
    const userId = req.user.id

    listCards({stripe, userId, StripeCustomer}, (err, cards) => {
      if (err) return sendError(res, err)
      res.json(cards)
    })
  }

  function handleSetDefaultCard(req, res) {
    const userId = req.user.id
    const cardId = req.params.cardId

    setDefaultCard({stripe, userId, cardId, StripeCustomer}, (err, status) => {
      if (err) return sendError(res, err)
      res.json(status)
    })
  }

  function handleDeleteCard(req, res) {
    const userId = req.user.id
    const cardId = req.params.cardId

    deleteCard({stripe, userId, cardId, StripeCustomer}, (err, status) => {
      if (err) return sendError(res, err)
      res.json(status)
    })
  }

  function handleChargeCustomer(req, res) {
    const userId = req.user.id
    const amount = +req.body.amount
    if (!amount) return res.status(400).send('[fl-stripe-server] Missing an amount to charge')
    if (amount > options.maxAmount) return res.status(401).send('[fl-stripe-server] Charge exceeds the configured maximum amount')

    chargeCustomer({stripe, userId, amount, currency: options.currency, StripeCustomer}, (err, status) => {
      if (err) return sendError(res, err)
      if (!status) return res.status(404).send('[fl-stripe-server] Customer not found')
      res.json(status)
    })
  }

  function handleListPlans(req, res) {
    listPlans({stripe}, (err, plans) => {
      if (err) return sendError(res, err)
      res.json(plans)
    })
  }

  function handleGetCoupon(req, res) {
    getCoupon({stripe, coupon: req.params.id}, (err, coupon) => {
      if (err) return sendError(res, err)
      res.json(coupon)
    })
  }

  function handleShowSubscription(req, res) {
    const userId = req.user.id

    showSubscription({stripe, userId, StripeCustomer}, (err, subscription) => {
      if (err) return sendError(res, err)
      if (!subscription) return res.status(404).send('[fl-stripe-server] Subscription not found for current user')
      res.json(subscription)
    })
  }

  function handleSubscribeToPlan(req, res) {
    const { planId } = req.params
    const { coupon } = req.body
    const userId = req.user.id

    subscribeToPlan({stripe, userId, planId, coupon, StripeCustomer, onSubscribe: options.onSubscribe}, (err, subscription) => {
      if (err) return sendError(res, err)
      if (!subscription) return res.status(404).send('[fl-stripe-server] Subscription not found for current user')
      res.json(subscription)
    })
  }

  const auth = options.manualAuthorisation ? options.auth : [...options.auth, createAuthMiddleware({canAccess})]

  app.post(`${options.route}/cards`, auth, handleCreateCard)
  app.get(`${options.route}/cards`, auth, handleListCards)
  app.put(`${options.route}/cards/default`, auth, handleSetDefaultCard)
  app.delete(`${options.route}/cards/:id`, auth, handleDeleteCard)

  app.post(`${options.route}/charge`, auth, handleChargeCustomer)

  app.get(`${options.route}/plans`, handleListPlans)

  app.get(`${options.route}/coupons/:id`, handleGetCoupon)

  app.get(`${options.route}/subscription`, auth, handleShowSubscription)
  app.put(`${options.route}/subscribe/:planId`, auth, handleSubscribeToPlan)

  return {
    canAccess,
    handleCreateCard,
    handleListCards,
    handleDeleteCard,
    handleSetDefaultCard,
    handleChargeCustomer,
    handleListPlans,
    handleGetCoupon,
    handleShowSubscription,
    handleSubscribeToPlan,
    StripeCustomer,
  }
}
