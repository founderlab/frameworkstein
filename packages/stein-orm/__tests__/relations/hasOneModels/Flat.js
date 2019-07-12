import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from '../../../src'
import Owner from './Owner'


@createModel({
  Store: require('stein-orm-sql').default,
  url: `${process.env.DATABASE_URL}/flats`,
})
export default class Flat extends Model {

  static schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    owner() { return ['hasOne', Owner] },
  })

}
