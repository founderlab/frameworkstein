import _ from 'lodash'


export async function createSource(options) {
  const { stripe, token, userId, description, StripeCustomer } = options

  // Check for an existing (local) stripe customer record
  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  let source = {}

  // Add the new source to the current record if it exists
  if (customer) {
    source = await stripe.customers.createSource(customer.stripeId, {source: token})
  }
  // Otherwise create a new customer with the given source token
  else {
    const customerJSON = await stripe.customers.create({description, source: token})
    if (customerJSON.sources && customerJSON.sources.data) source = customerJSON.sources.data[0]
    const customerModel = new StripeCustomer({user_id: userId, stripeId: customerJSON.id})

    await customerModel.save()
  }

  return source
}

export async function listSources(options) {
  const { stripe, userId, StripeCustomer } = options

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return []

  const remoteCustomer = await stripe.customers.retrieve(customer.stripeId)
  const json = await stripe.customers.listSources(customer.stripeId)

  return _.map(json.data, source => ({...source, default: remoteCustomer.default_source === source.id}))
}

export async function setDefaultSource(options) {
  const { stripe, userId, sourceId, StripeCustomer } = options
  if (!userId) throw new Error('setDefaultSource requires a userId')
  if (!sourceId) throw new Error('setDefaultSource requires a sourceId')

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return {exists: false}

  await stripe.customers.update(customer.stripeId, {default_source: sourceId})
  return {ok: true}
}

export async function deleteSource(options) {
  const { stripe, userId, sourceId, StripeCustomer } = options
  if (!userId) throw new Error('deleteSource requires a userId')
  if (!sourceId) throw new Error('deleteSource requires a sourceId')

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return {exists: false}

  await stripe.customers.deleteSource(customer.stripeId, sourceId)
  return {ok: true}
}

export async function chargeCustomer(options) {
  const { stripe, userId, amount, currency, StripeCustomer } = options
  if (!amount) throw new Error('chargeCustomer requires an amount')
  if (!currency) throw new Error('chargeCustomer requires a currency')

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return {exists: false}

  await stripe.charges.create({
    amount,
    currency,
    customer: customer.stripeId,
  })
  return {ok: true}
}

export async function getCustomer(options) {
  const { stripe, userId, StripeCustomer } = options

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return null

  const json = await stripe.customers.retrieve(customer.stripeId)
  return json.data
}

export async function listPlans(options) {
  const json = await options.stripe.plans.list()
  return json.data
}

export async function getSubscription(options) {
  const { stripe, userId, StripeCustomer } = options

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return {exists: false}

  return stripe.subscriptions.retrieve(customer.subscriptionId)
}

export async function getCoupon(options) {
  const { stripe, coupon } = options
  return stripe.coupons.retrieve(coupon)
}

// Set a users plan, changing the current one if it exists
export async function subscribeToPlan(options) {
  const { stripe, userId, planId, coupon, StripeCustomer } = options

  const customer = await StripeCustomer.cursor({user_id: userId, $one: true}).toJSON()
  if (!customer) return {exists: false}

  let subscription
  const currentSubscriptionId = customer.subscriptionId
  const subscriptionOptions = {plan: planId}
  if (!_.isUndefined(coupon)) subscriptionOptions.coupon = coupon

  // If a subscription exists update it to the new plan
  if (currentSubscriptionId) {
    subscription = await stripe.subscriptions.update(currentSubscriptionId, subscriptionOptions)
  }
  // Otherwise create a new subscription
  else {
    subscriptionOptions.customer = customer.stripeId
    subscription = await stripe.subscriptions.create(subscriptionOptions)
  }

  customer.subscriptionId = subscription.id
  const cust = new StripeCustomer(customer)
  await cust.save()

  if (options.onSubscribe) await options.onSubscribe({userId, subscription})

  return subscription
}
