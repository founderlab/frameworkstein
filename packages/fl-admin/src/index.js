import 'babel-polyfill' // import first to avoid probs with `regeneratorRuntime` not being defined, see https://github.com/babel/babel-preset-env/issues/112
import _ from 'lodash'
import warning from 'warning'
import { combineReducers } from 'redux'
import { Pagination } from 'fl-react-utils'

import SmartInput from './components/inputs/SmartInput'
import createRelatedInput from './containers/create/RelatedInput'
import { table, plural, upper, label } from './utils/naming'
import createActions from './createActions'
import createReducer from './createReducer'
import getRoutes from './routes'


const ACTION_PREFIX = 'FL_ADMIN_'
const modelAdmins = []
const actions = {}
const reducers = {}
let reducer

const defaults = {
  rootPath: '/admin',
  isAModel: Model => !!Model.schema,
}

// Ensure the display fn always gives a string of some sort
const wrapDisplayFn = (modelAdmin, oldDisplay) => model => {
  let res
  try {
    res = oldDisplay ? oldDisplay(model) : null
  }
  catch (err) {
    warning(false, `[fl-admin] Error rendering model display name: ${err}`)
    res = null
  }
  return res || (model && model.id ? `[No name: ${model.id}]` : `A brand new ${modelAdmin.name}`)
}

function createModelAdmin(options, modelDescriptor) {
  const modelAdmin = {}
  if (options.isAModel(modelDescriptor)) modelAdmin.Model = modelDescriptor
  else if (_.isObject(modelDescriptor)) _.merge(modelAdmin, modelDescriptor)
  else throw new Error('[fl-admin] configure: Unrecognized model descriptor - provide a string or model or modelAdmin')

  const { Model } = modelAdmin

  const defaults = {
    name: Model.modelName || Model.model_name || Model.name,
    display: model => model.name || model.title,
    sort: 'id',
    perPage: 50,
    listDelete: false,
    rootPath: options.rootPath,
    path: table(Model),
    plural: plural(Model),
    actionType: `${ACTION_PREFIX}${upper(Model)}`,
    fields: {},
    readOnlyFields: ['createdDate'],
    relationFields: {}, //references the same fields as `fields` (relations only) but is indexed by virtualIdAccessor
    components: {},
  }

  _.defaults(modelAdmin, defaults)

  modelAdmin.display = wrapDisplayFn(modelAdmin, modelAdmin.display)

  // Function to generate the path to a models edit page
  if (!modelAdmin.link) {
    modelAdmin.link = model => {
      const modelId = model ? model.id || model : ''
      return `${options.rootPath}/${modelAdmin.path}/${modelId}`
    }
    modelAdmin.createLink = () => modelAdmin.link('create')
  }

  Model.schema.initialize()
  const schema = Model.schema
  const fields = schema.fields || {}
  const relationFields = schema.relations || {}
  const defaultSearchFields = []

  // Make sure we have config for every field in the models schema
  _.forEach(fields, (field, key) => {
    if (key === 'id') return
    const modelField = modelAdmin.fields[key] = modelAdmin.fields[key] || {}
    _.defaults(modelField, field)
    modelField.key = modelField.key || key
    modelField.label = modelField.label || label(key)
    if (modelField.InputComponent) {
      modelField._customInput = true
    }
    else {
      modelField.InputComponent = SmartInput
    }
    if (_.includes(modelAdmin.readOnlyFields, key)) modelField.input = 'static'
    if (field.type && field.type.toLowerCase() === 'text') defaultSearchFields.push(key)
  })

  if (!modelAdmin.searchFields) modelAdmin.searchFields = defaultSearchFields

  // Make sure we have config for every relation
  _.forEach(relationFields, (relation, key) => {
    const modelField = modelAdmin.relationFields[relation.virtualIdAccessor] = modelAdmin.fields[key] = modelAdmin.fields[key] || {}
    _.defaults(modelField, _.pick(relation, 'type', 'virtualIdAccessor', 'components'))
    modelField.Model = relation.reverseModelType
    modelField.key = modelField.key || key
    modelField.label = modelField.label || label(key)
    modelField.relation = relation
  })

  _.forEach(modelAdmin.fields, modelField => {
    if (!modelField.InputComponent) modelField.InputComponent = SmartInput
    // modelField.type = modelField.type && modelField.type.toLowerCase()
  })

  // Generate actions and a reducer for this model type
  modelAdmin.actions = actions[modelAdmin.path] = createActions(modelAdmin)
  modelAdmin.reducer = reducers[modelAdmin.path] = createReducer(modelAdmin)

  if (!modelAdmin.components.Pagination) modelAdmin.components.Pagination = Pagination

  return modelAdmin
}

export default function configure(_options) {
  const options = _.merge(defaults, _options)

  _.forEach(options.models, modelDescriptor => {
    modelAdmins.push(createModelAdmin(options, modelDescriptor))
  })

  // Second pass too hook up related modelAdmins
  _.forEach(modelAdmins, modelAdmin => {
    _.forEach(modelAdmin.relationFields, modelField => {
      modelField.modelAdmin = _.find(modelAdmins, ma => ma.Model === modelField.Model)

      warning(modelField.modelAdmin, `[fl-admin] configure: Couldnt find modelAdmin for the relation ${modelField.key} of ${modelAdmin.name}`)

      if (!modelField._customInput) {
        modelField.InputComponent = createRelatedInput(modelField, modelAdmin)
      }
    })
  })

  reducer = combineReducers(reducers)
}

export {actions, reducer, modelAdmins, getRoutes}
