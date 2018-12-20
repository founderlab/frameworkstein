import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from '../../../src'
import Owner from './Owner'


@createModel({
  url: `${process.env.DATABASE_URL}/reverses`,
})
export default class Reverse extends Model {

  static schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    owner() { return ['belongsTo', require('./Owner')] },
    ownerAs() { return ['belongsTo', Owner, {as: 'reverseAs'}] },
  })

}
