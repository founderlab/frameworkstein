import request from 'superagent'

export const TYPES = {
  CARD_CREATE: 'FL_STRIPE_CARD_CREATE',
  CARD_LOAD: 'FL_STRIPE_CARD_LOAD',
  CARD_DELETE: 'FL_STRIPE_CARD_DELETE',
  CUSTOMER_CHARGE: 'FL_CUSTOMER_CHARGE',
}

export function createCard(url, apiKey, userId, cardData, callback) {
  const cardString = `card[name]=${'test'}&` +
    `card[number]=${cardData.number}&` +
    `card[exp_month]=${cardData.exp_month}&` +
    `card[exp_year]=${cardData.exp_year}&` +
    `card[cvc]=${cardData.cvc}`

  return {
    type: TYPES.CARD_CREATE,
    request: callback => {
      request.post('https://api.stripe.com/v1/tokens')
        .set('Authorization', `Bearer ${apiKey}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(cardString)
        .end((err, res) => {
          if (err) return callback(err)
          if (res.status !== 200) {
            return callback('There was a problem validating your card. Please check that all fields are entered correctly')
          }
          const tokenData = {user_id: userId, token: res.body.id}
          request.post(`${url}/api/stripe/cards`).send(tokenData).end(callback)
        })
    },
    callback,
  }
}

export function loadCards(url, userId, callback) {
  return {
    type: TYPES.CARD_LOAD,
    request: request.get(`${url}/api/stripe/cards`).query({user_id: userId}),
    callback,
  }
}

export function setDefaultCard(url, userId, cardId, callback) {
  return {
    type: TYPES.CARD_DEFAULT,
    defaultId: cardId,
    request: request.put(`${url}/api/stripe/cards/default`).send({user_id: userId, id: cardId}),
    callback,
  }
}

export function deleteCard(url, cardId, callback) {
  return {
    type: TYPES.CARD_DELETE,
    deletedId: cardId,
    request: request.del(`${url}/api/stripe/cards/${cardId}`),
    callback,
  }
}

export function chargeCustomer(url, userId, amount, callback) {
  return {
    type: TYPES.CUSTOMER_CHARGE,
    request: request.put(`${url}/api/stripe/cards/default`).send({amount, user_id: userId}),
    callback,
  }
}
