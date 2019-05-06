
export default options =>
`import _ from 'lodash' // eslint-disable-line
import ${options.className} from '../../../models/${options.className}'


export default {
  $select: [...${options.className}.schema.columns()],
}
`
