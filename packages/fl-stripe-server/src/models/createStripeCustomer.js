import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import Backbone from 'backbone'
import {smartSync} from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default function createStripeCustomer(User) {
  class StripeCustomer extends Backbone.Model {
    url = `${dbUrl}/stripe_customers`

    schema = () => ({
      stripeId: 'Text',
      createdDate: 'DateTime',
      user: () => ['belongsTo', User],
    })

    defaults() { return {createdDate: moment.utc().toDate()} }
  }

  StripeCustomer.prototype.sync = smartSync(dbUrl, StripeCustomer)

  return StripeCustomer
}
