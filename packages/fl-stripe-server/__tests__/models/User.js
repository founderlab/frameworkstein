import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/users`,
})
export default class User extends Model {

  static schema = () => ({
    stripeCustomer: () => ['hasOne', require('./StripeCustomer')],
    createdDate: 'Text',
  })

}
