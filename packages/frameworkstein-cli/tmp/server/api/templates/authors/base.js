import _ from 'lodash' // eslint-disable-line
import Author from '../../../../shared/models/Author'

export default {
  $select: [...Author.schema.columns()],
}
