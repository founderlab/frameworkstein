import _ from 'lodash'
import createStripe from 'stripe'
import { createAuthMiddleware } from 'fl-auth-server'
import {
  createSource,
  listSources,
  deleteSource,
  setDefaultSource,
  chargeCustomer,
  listPlans,
  getCoupon,
  getSubscription,
  subscribeToPlan,
} from './interface'


const defaults = {
  route: '/api/stripe',
  manualAuthorisation: false,
  sourceWhitelist: ['id', 'country', 'brand', 'last4', 'default'],
  currency: 'aud',
  maxAmount: 500 * 100, // $500
}

function sendError(res, err, msg) {
  console.log('[fl-stripe-server] error:', err)
  res.status(500).send({error: msg || err && err.toString()})
}

export default function createStripeController(_options) {
  const options = _.defaults(_options, defaults)
  const { app, User, StripeCustomer } = options

  if (!app) return console.error('createStripeController requires an `app` option, got', _options)
  if (!User) return console.error('createStripeController requires a `User` model in options, got', _options)
  if (!StripeCustomer) return console.error('createStripeController requires a `StripeCustomer` model in options, got', _options)

  const globalStripeKey = options.apiKey || process.env.STRIPE_API_KEY
  const globalStripe = options.stripe || (globalStripeKey ? createStripe(globalStripeKey) : null)

  function getStripe(req) {
    if (globalStripe) return globalStripe
    if (options.getStripe) return options.getStripe(req)
  }

  // Authorisation check. Make sure we can only work with sources (StripeCustomer models) belonging to the logged in user
  let canAccessAsync = options.canAccessAsync
  if (!canAccessAsync) {
    canAccessAsync = async options => {
      if (!options.user) return false
      // No additional options; use the logged in user id as the context for all interactions wth Stripe
      return true
    }
  }

  async function handleCreateSource(req, res) {
    try {
      const token = req.body.token // obtained with Stripe.js
      const userId = req.user.id
      const source = await createSource({stripe: getStripe(req), userId, token, description: `User ${req.user.email}`, StripeCustomer})
      res.json(_.pick(source, options.sourceWhitelist))
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleListSources(req, res) {
    try {
      const userId = req.user.id
      const sources = await listSources({stripe: getStripe(req), userId, StripeCustomer})
      res.json(_.map(sources, source => _.pick(source, options.sourceWhitelist)))
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleSetDefaultSource(req, res) {
    try {
      const userId = req.user.id
      const sourceId = req.body.sourceId
      const status = await setDefaultSource({stripe: getStripe(req), userId, sourceId, StripeCustomer})
      res.json(status)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleDeleteSource(req, res) {
    try {
      const userId = req.user.id
      const sourceId = req.params.sourceId
      const status = await deleteSource({stripe: getStripe(req), userId, sourceId, StripeCustomer})
      res.json(status)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleChargeCustomer(req, res) {
    try {
      const userId = req.user.id
      const amount = +req.body.amount
      if (!amount) return res.status(400).send('[fl-stripe-server] Missing an amount to charge')
      if (amount > options.maxAmount) return res.status(401).send('[fl-stripe-server] Charge exceeds the configured maximum amount')

      const status = await chargeCustomer({stripe: getStripe(req), userId, amount, currency: options.currency, StripeCustomer})
      if (!status) return res.status(404).send('[fl-stripe-server] Customer not found')
      res.json(status)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleListPlans(req, res) {
    try {
      const plans = await listPlans({stripe: getStripe(req)})
      res.json(plans)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleGetCoupon(req, res) {
    try {
      const coupon = await getCoupon({stripe: getStripe(req), coupon: req.params.id})
      res.json(coupon)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleShowSubscription(req, res) {
    try {
      const userId = req.user.id
      const subscription = await getSubscription({stripe: getStripe(req), userId, StripeCustomer})
      if (!subscription) return res.status(404).send('[fl-stripe-server] Subscription not found for current user')
      res.json(subscription)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  async function handleSubscribeToPlan(req, res) {
    try {
      const { planId } = req.params
      const { coupon } = req.body
      const userId = req.user.id

      const subscription = await subscribeToPlan({stripe: getStripe(req), userId, planId, coupon, StripeCustomer, onSubscribe: options.onSubscribe})
      if (!subscription) return res.status(404).send('[fl-stripe-server] Subscription not found for current user')
      res.json(subscription)
    }
    catch (err) {
      sendError(res, err)
    }
  }

  const auth = options.manualAuthorisation ? options.auth : [...(options.auth || []), createAuthMiddleware({canAccessAsync})]

  app.post(`${options.route}/sources`, auth, handleCreateSource)
  app.get(`${options.route}/sources`, auth, handleListSources)
  app.put(`${options.route}/sources/default`, auth, handleSetDefaultSource)
  app.delete(`${options.route}/sources/:sourceId`, auth, handleDeleteSource)

  app.post(`${options.route}/charge`, auth, handleChargeCustomer)

  app.get(`${options.route}/plans`, handleListPlans)

  app.get(`${options.route}/coupons/:id`, handleGetCoupon)

  app.get(`${options.route}/subscription`, auth, handleShowSubscription)
  app.put(`${options.route}/subscribe/:planId`, auth, handleSubscribeToPlan)

  return {
    canAccessAsync,
    createSource: handleCreateSource,
    listSources: handleListSources,
    deleteSource: handleDeleteSource,
    setDefaultSource: handleSetDefaultSource,
    chargeCustomer: handleChargeCustomer,
    listPlans: handleListPlans,
    getCoupon: handleGetCoupon,
    getSubscription: handleShowSubscription,
    subscribeToPlan: handleSubscribeToPlan,
  }
}
