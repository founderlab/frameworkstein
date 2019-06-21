import _ from 'lodash' // eslint-disable-line
import Post from '../../../../shared/models/Post'

export default {
  $select: [...Post.schema.columns()],
}
