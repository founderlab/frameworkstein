import _ from 'lodash' // eslint-disable-line
import { createModel, Model } from '../../../src'


@createModel({
  Store: require('stein-orm-sql').default,
  url: `${process.env.DATABASE_URL}/self_owners`,
})
export default class SelfOwner extends Model {

  static schema = () => ({
    name: 'Text',
    createdDate: 'DateTime',
    updatedDate: 'DateTime',
    childOwners: () => ['hasMany', SelfOwner, {as: 'parentOwners', through: 'owner_links', self: true}],
    parentOwners: () => ['hasMany', SelfOwner, {as: 'childOwners', self: true}],
  })

}
