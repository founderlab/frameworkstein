import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from '../../../src'


@createModel({
  url: `${process.env.DATABASE_URL}/foreign_reverses`,
})
export default class ForeignReverse extends Model {

  static schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    owner() { return ['belongsTo', require('./Owner'), {foreignKey: 'ownerish_id'}] },
  })

}
