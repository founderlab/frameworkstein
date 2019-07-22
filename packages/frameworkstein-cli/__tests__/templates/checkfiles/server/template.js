import _ from 'lodash' // eslint-disable-line
import TestModel from '../../models/TestModel'


export default {
  $select: [...TestModel.schema.columns()],
}
