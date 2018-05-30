import _ from 'lodash' // eslint-disable-line
import { fromJS } from 'immutable'
import { TYPES } from './actions'

const defaultState = fromJS({
  errors: {},
  loading: false,
  loadingCards: false,
  cards: {},
})

export default function reducer(state=defaultState, action={}) {

  switch (action.type) {
    case TYPES.CARD_LOAD + '_START':
      return state.merge({loadingCards: true, errors: {}})
    case TYPES.CARD_LOAD + '_ERROR':
      return state.merge({loadingCards: false, errors: {load: action.error || action.res.body.error}})

    case TYPES.CARD_CREATE + '_START':
    case TYPES.CARD_DELETE + '_START':
    case TYPES.CARD_DEFAULT + '_START':
    case TYPES.CARD_CHARGE + '_START':
      return state.merge({loading: true, errors: {}})

    case TYPES.CARD_CREATE + '_ERROR':
      return state.merge({loading: false, errors: {create: action.error || action.res.body.error}})
    case TYPES.CARD_DELETE + '_ERROR':
      return state.merge({loading: false, errors: {delete: action.error || action.res.body.error}})
    case TYPES.CARD_DEFAULT + '_ERROR':
      return state.merge({loading: false, errors: {default: action.error || action.res.body.error}})
    case TYPES.CARD_CHARGE + '_ERROR':
      return state.merge({loading: false, errors: {charge: action.error || action.res.body.error}})

    case TYPES.CARD_LOAD + '_SUCCESS':
      return state.merge({
        loadingCards: false,
        cardsLoaded: true,
        errors: {},
        cards: action.models,
      })

    case TYPES.CARD_CREATE + '_SUCCESS':
      const ccc = state.get('cards').toJSON()
      action.model.default = !_.size(ccc)
      return state.merge({
        loading: false,
        errors: {},
      }).mergeDeep({
        cards: {[action.model.id]: action.model},
      })

    case TYPES.CARD_DELETE + '_SUCCESS':
      const newCards = state.get('cards').toJSON()
      delete newCards[action.deletedId]
      if (_.size(newCards) === 1) {
        _.forEach(newCards, c => c.default = true)
      }
      return state.merge({
        loading: false,
        errors: {},
        cards: newCards,
      })

    case TYPES.CARD_DEFAULT + '_SUCCESS':
      const cards = state.get('cards').toJSON()
      _.forEach(cards, (card, id) => {
        if (id !== action.defaultId) {
          delete card.default
        }
        else {
          card.default = true
        }
      })
      return state.merge({
        cards,
        loading: false,
        errors: {},
      })

    case TYPES.CUSTOMER_CHARGE + '_SUCCESS':
      return state.merge({
        loading: false,
        errors: {},
      }).mergeDeep({
        charges: action.models,
      })

    default:
      return state

  }
}
