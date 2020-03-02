import fetch from 'cross-fetch'
import qs from 'qs'


export const TYPES = {
  CARD_CREATE: 'FL_STRIPE_CARD_CREATE',
  CARD_LOAD: 'FL_STRIPE_CARD_LOAD',
  CARD_DELETE: 'FL_STRIPE_CARD_DELETE',
  CUSTOMER_CHARGE: 'FL_CUSTOMER_CHARGE',
}

export function createCard(url, apiKey, userId, cardData) {
  const cardString = `card[name]=${cardData.name}&` +
    `card[number]=${cardData.number}&` +
    `card[exp_month]=${cardData.exp_month}&` +
    `card[exp_year]=${cardData.exp_year}&` +
    `card[cvc]=${cardData.cvc}`

  return {
    type: TYPES.CARD_CREATE,
    request: async () => {
      const res = await fetch('https://api.stripe.com/v1/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${apiKey}`,
        },
        body: cardString,
      })
      if (res.status !== 200) {
        throw new Error('There was a problem validating your card. Please check that all fields are entered correctly')
      }
      const tokenData = {user_id: userId, token: res.body.id}
      return fetch(`${url}/api/stripe/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      })
    },
  }
}

export function loadCards(url, userId) {
  return {
    type: TYPES.CARD_LOAD,
    request: fetch(`${url}/api/stripe/cards?${qs.stringify({query: JSON.stringify({user_id: userId})})}`),
  }
}

export function setDefaultCard(url, userId, cardId) {
  return {
    type: TYPES.CARD_DEFAULT,
    defaultId: cardId,
    request: fetch(`${url}/api/stripe/cards/default`, {
      method: 'PUT',
      body: JSON.stringify({user_id: userId, id: cardId}),
    }),
  }
}

export function deleteCard(url, cardId) {
  return {
    type: TYPES.CARD_DELETE,
    deletedId: cardId,
    request: fetch(`${url}/api/stripe/cards/${cardId}`, {method: 'DELETE'}),
  }
}

export function chargeCustomer(url, userId, amount) {
  return {
    type: TYPES.CUSTOMER_CHARGE,
    request: fetch(`${url}/api/stripe/cards/default`, {
      method: 'PUT',
      body: JSON.stringify({amount, user_id: userId}),
    }),
  }
}
