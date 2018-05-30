import _ from 'lodash'
import Queue from 'queue-async'

const handleError = (err, callback) => {
  console.error(err)
  return callback(err)
}

function createCard(options, callback) {
  const { stripe, source, userId, description, StripeCustomer } = options

  // Check for an existing (local) stripe customer record
  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    let card = {}
    const queue = new Queue(1)

    // Add the new card to the current record if it exists
    if (customer) {
      queue.defer(callback => {
        stripe.customers.createSource(customer.stripeId, {source}, (err, _card) => {
          if (err) return handleError(err, callback)
          card = _card
          callback()
        })
      })
    }

    // Otherwise create a new customer with the given card token
    else {
      queue.defer(callback => {
        stripe.customers.create({description, source}, (err, customerJSON) => {
          if (err) return handleError(err, callback)

          if (customerJSON.sources && customerJSON.sources.data) card = customerJSON.sources.data[0]
          const customerModel = new StripeCustomer({user_id: userId, stripeId: customerJSON.id})

          customerModel.save(err => {
            if (err) return handleError(err, callback)
            callback()
          })
        })
      })
    }

    queue.await(err => callback(err, card))
  })
}

function listCards(options, callback) {
  const { stripe, userId, StripeCustomer } = options

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, `Error retrieving customer for user ${user.id}`, callback)
    if (!customer) return callback(null, [])

    stripe.customers.retrieve(customer.stripeId, (err, remoteCustomer) => {
      if (err) return handleError(err, callback)

      stripe.customers.listCards(customer.stripeId, (err, json) => {
        if (err) return handleError(err, callback)

        const cards = _.map(json.data, card => {
          const cardData = _.pick(card, options.cardWhitelist)
          cardData.default = remoteCustomer.default_source === cardData.id
          return cardData
        })
        callback(null, cards)
      })
    })
  })
}

function setDefaultCard(options, callback) {
  const { stripe, userId, cardId, StripeCustomer } = options
  if (!cardId) return callback(new Error('setDefaultCard requires a cardId'))

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    if (!customer) return callback()

    stripe.customers.update(customer.stripeId, {default_source: cardId}, err => {
      if (err) return handleError(err, callback)
      callback(null, {ok: true})
    })
  })
}

function deleteCard(options, callback) {
  const { stripe, userId, cardId, StripeCustomer } = options
  if (!cardId) return callback(new Error('deleteCard requires a cardId'))

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    if (!customer) return callback()

    stripe.customers.deleteCard(customer.stripeId, cardId, err => {
      if (err) return handleError(err, callback)
      callback(null, {ok: true})
    })
  })
}

function chargeCustomer(options, callback) {
  const { stripe, userId, amount, currency, StripeCustomer } = options
  if (!amount) return callback(new Error('chargeCustomer requires an amount'))
  if (!currency) return callback(new Error('chargeCustomer requires a currency'))

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    if (!customer) return callback()

    stripe.charges.create({
      amount,
      currency,
      customer: customer.stripeId,
    }, err => {
      if (err) return handleError(err, callback)
      return callback(null, {ok: true})
    })
  })
}

function listPlans(options, callback) {
  options.stripe.plans.list((err, json) => {
    if (err) return handleError(err, callback)
    callback(null, json.data)
  })
}

function showSubscription(options, callback) {
  const { stripe, userId, StripeCustomer } = options

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    if (!customer) return callback()

    stripe.subscriptions.retrieve(customer.subscriptionId, callback)
  })
}

function getCoupon(options, callback) {
  const { coupon } = options

  options.stripe.coupons.retrieve(coupon, (err, json) => {
    if (err) return handleError(err, callback)
    callback(null, json)
  })
}

// Set a users plan, changing the current one if it exists
function subscribeToPlan(options, callback) {
  const { stripe, userId, planId, coupon, StripeCustomer } = options

  StripeCustomer.cursor({user_id: userId, $one: true}).toJSON((err, customer) => {
    if (err) return handleError(err, callback)
    if (!customer) return callback()

    let subscription
    const currentSubscriptionId = customer.subscriptionId
    const subscriptionOptions = {plan: planId}
    if (!_.isUndefined(coupon)) subscriptionOptions.coupon = coupon
    const queue = new Queue(1)

    // If a subscription exists update it to the new plan
    if (currentSubscriptionId) {
      queue.defer(callback => {
        stripe.subscriptions.update(currentSubscriptionId, subscriptionOptions, (err, _subscription) => {
          if (err) return handleError(err, callback)
          subscription = _subscription
          callback()
        })
      })
    }
    // Otherwise create a new subscription
    else {
      queue.defer(callback => {
        subscriptionOptions.customer = customer.stripeId
        stripe.subscriptions.create(subscriptionOptions, (err, _subscription) => {
          if (err) return handleError(err, callback)
          subscription = _subscription
          callback()
        })
      })
    }

    queue.defer(callback => {
      customer.subscriptionId = subscription.id
      const cust = new StripeCustomer(customer)
      cust.save(callback)
    })

    if (options.onSubscribe) queue.defer(callback => options.onSubscribe({userId, subscription}, callback))

    queue.await(err => {
      if (err) return callback(err)
      callback(null, subscription)
    })
  })
}

export {
  createCard,
  listCards,
  deleteCard,
  setDefaultCard,
  chargeCustomer,
  listPlans,
  getCoupon,
  showSubscription,
  subscribeToPlan,
}
