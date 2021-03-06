import _ from 'lodash' // eslint-disable-line
import moment from 'moment'
import { createModel, Model } from 'stein-orm-sql'


const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

@createModel({
  url: `${dbUrl}/testModels`,
})
export default class TestModel extends Model {

  static schema = () => ({
    myTextField: 'Text',
    myIntegerField: 'Integer',
    createdDate: 'DateTime',
  })

  defaults = () => ({createdDate: new Date()})
}
