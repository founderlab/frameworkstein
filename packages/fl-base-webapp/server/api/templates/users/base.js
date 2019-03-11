import _ from 'lodash' // eslint-disable-line
import User from '../../../models/User'


export default {
  $select: [
    _.omit(User.schema.columns(), 'password'),
  ],
}
