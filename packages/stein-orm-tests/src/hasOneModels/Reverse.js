import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm'
import Owner from './Owner'


@createModel({
  Store: require('stein-orm-sql'),
  url: `${process.env.DATABASE_URL}/reverses`,
})
export default class Reverse extends Model {

  static schema = () => ({
    name: 'Text',
    tenPlus: 'Integer',
    tenMinus: 'Integer',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    owner() { return ['belongsTo', require('./Owner')] },
    ownerAs() { return ['belongsTo', Owner, {as: 'reverseAs'}] },
  })

}
