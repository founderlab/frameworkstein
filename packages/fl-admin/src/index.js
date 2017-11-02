import _ from 'lodash'
import warning from 'warning'
import {combineReducers} from 'redux'
import {Pagination} from 'fl-react-utils'

import SmartInput from './components/inputs/SmartInput'
import createRelatedInput from './containers/create/RelatedInput'
import {table, plural, upper, label} from './utils/naming'
import createActions from './createActions'
import createReducer from './createReducer'
import AdminRoute from './route'

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

  const {Model} = modelAdmin

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
    relationFields: {}, //references the same fields as `fields` (relations only) but is indexed by virtual_id_accessor
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

  const schema = Model.schema && Model.schema('schema')
  const fields = schema.fields || {}
  const relationFields = schema.relations || {}

  // Make sure we have config for every field in the models schema
  _.forEach(fields, (modelField, key) => {
    const adminField = modelAdmin.fields[key] = modelAdmin.fields[key] || {}
    _.defaults(adminField, modelField)
    adminField.key = adminField.key || key
    adminField.label = adminField.label || label(key)
    if (adminField.InputComponent) {
      adminField._customInput = true
    }
    else {
      adminField.InputComponent = SmartInput
    }
    if (_.includes(modelAdmin.readOnlyFields, key)) adminField.input = 'static'
  })

  // Make sure we have config for every relation
  _.forEach(relationFields, (relation, key) => {
    const adminField = modelAdmin.relationFields[relation.virtual_id_accessor] = modelAdmin.fields[key] = modelAdmin.fields[key] || {}
    _.defaults(adminField, _.pick(relation, 'type', 'virtual_id_accessor', 'components'))
    adminField.Model = relation.reverse_model_type
    adminField.key = adminField.key || key
    adminField.label = adminField.label || label(key)
    adminField.relation = relation
  })

  _.forEach(modelAdmin.fields, adminField => {
    if (!adminField.InputComponent) adminField.InputComponent = SmartInput
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
    _.forEach(modelAdmin.relationFields, adminField => {
      adminField.modelAdmin = _.find(modelAdmins, ma => ma.Model === adminField.Model)
      warning(adminField.modelAdmin, `[fl-admin] configure: Couldnt find modelAdmin for the relation ${adminField.key} of ${modelAdmin.name}`)
      if (!adminField._customInput) {
        adminField.InputComponent = createRelatedInput(adminField)
      }
    })
  })

  reducer = combineReducers(reducers)
}

export {actions, reducer, modelAdmins, AdminRoute}
