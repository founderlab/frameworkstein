import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/stripe_customers`,
})
export default class StripeCustomer extends Model {

  static schema = () => ({
    user: () => ['belongsTo', require('./User')],
    stripeId: 'Text',
    subscriptionId: 'Text',
    createdDate: 'Text',
  })

}
