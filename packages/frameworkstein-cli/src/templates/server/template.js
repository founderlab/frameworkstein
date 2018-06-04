
export default options =>
`import _ from 'lodash' // eslint-disable-line
import schema from '../../../../shared/models/schemas/${options.variableName}'

export default {
  $select: [
    'id',
    ..._.keys(schema),
  ],
}
`
