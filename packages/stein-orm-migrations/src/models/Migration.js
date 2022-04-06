import { createModel, Model } from 'stein-orm-sql'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/migrations`,
})
export default class Migration extends Model {

  static schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
  })

  defaults = () => ({createdDate: new Date()})
}
