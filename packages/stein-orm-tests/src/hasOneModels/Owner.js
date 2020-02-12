import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from 'stein-orm'
import Flat from './Flat'
import Reverse from './Reverse'
import ForeignReverse from './ForeignReverse'


@createModel({
  Store: require('stein-orm-sql'),
  url: `${process.env.DATABASE_URL}/owners`,
})
export default class Owner extends Model {

  static schema = () => ({
    name: 'Text',
    tenPlus: 'Integer',
    tenMinus: 'Integer',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    flat() { return ['belongsTo', Flat] },
    reverse() { return ['hasOne', Reverse] },
    reverseAs() { return ['hasOne', Reverse, {as: 'ownerAs'}] },
    foreignReverse() { return ['hasOne', ForeignReverse] },
  })

}
