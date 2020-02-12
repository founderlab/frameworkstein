import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm'
import Owner from './Owner'


@createModel({
  Store: require('stein-orm-sql'),
  url: `${process.env.DATABASE_URL}/flats`,
})
export default class Flat extends Model {

  static schema = () => ({
    name: 'Text',
    tenPlus: 'Integer',
    tenMinus: 'Integer',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    owner() { return ['hasOne', Owner] },
  })

}
