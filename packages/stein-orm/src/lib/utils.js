import _ from 'lodash'
import Model from '../Model'


export default class Utils {

  // @nodoc
  static isModel(obj) { return obj instanceof Model }

  //#############################
  // Data to Model Helpers
  //#############################

  // @nodoc
  static dataId(data) { if (_.isObject(data)) { return data.id }  return data  }

  // @nodoc
  static dataIsSameModel(data1, data2) {
    if (Utils.dataId(data1) || Utils.dataId(data2)) { return Utils.dataId(data1) === Utils.dataId(data2) }
    return _.isEqual(data1, data2)
  }

  // @nodoc
  static dataToModel(data, modelType) {
    let model
    if (!data) { return null }
    if (_.isArray(data)) { return data.map(item => Utils.dataToModel(item, modelType)) }
    if (Utils.isModel(data)) {
      model = data
    }
    else if (Utils.dataId(data) !== data) {
      model = new modelType(modelType.prototype.parse(data))
    }
    else {
      let attributes;
      (attributes = {})[modelType.prototype.idAttribute] = data
      model = new modelType(attributes)
    }

    return model
  }

  //#############################
  // Sorting
  //#############################
  // @nodoc
  static isSorted(models, fields) {
    fields = _.uniq(fields)
    let lastModel
    for (const model of Array.from(models)) {
      if (lastModel && (this.fieldCompare(lastModel, model, fields) === 1)) { return false }
      lastModel = model
    }
    return true
  }

  // @nodoc
  static fieldCompare(model, otherModel, fields) {
    let desc
    let field = fields[0]
    if (_.isArray(field)) { field = field[0] } // for mongo

    if (field.charAt(0) === '-') {
      field = field.substr(1)
      desc = true
    }
    if (model.data.field === otherModel.data.field) {
      if (fields.length > 1) { return this.fieldCompare(model, otherModel, fields.splice(1)) }  return 0
    }
    if (desc) {
      if (model.data.field < otherModel.data.field) { return 1 }  return -1
    }
    if (model.data.field > otherModel.data.field) { return 1 }  return -1

  }

  // @nodoc
  static jsonFieldCompare(model, otherModel, fields) {
    let desc
    let field = fields[0]
    if (_.isArray(field)) { field = field[0] } // for mongo

    // reverse
    if (field.charAt(0) === '-') { field = field.substr(1); desc = true }

    if (model[field] === otherModel[field]) {
      if (fields.length > 1) { return this.jsonFieldCompare(model, otherModel, fields.splice(1)) }  return 0
    }
    if (desc) {
      if (JSON.stringify(model[field]) < JSON.stringify(otherModel[field])) { return 1 }  return -1
    }
    if (JSON.stringify(model[field]) > JSON.stringify(otherModel[field])) { return 1 }  return -1

  }
}
