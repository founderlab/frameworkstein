import _ from 'lodash'
import {JSONUtils} from 'backbone-orm'

export function stripRev(obj) {
  if (_.isArray(obj)) return _.map(obj, o => stripRev(o))
  if (_.isObject(obj) && !(obj instanceof Date)) {
    const final_obj = {}
    _.forEach(obj, (value, key) => {
      if (key !== '_rev') final_obj[key] = stripRev(value)
    })
    return final_obj
  }
  return obj
}

export default function render(req, json, callback) {
  let templateName = req.query.$render || req.query.$template || this.default_template
  if (!templateName) return callback(null, json)
  try {templateName = JSON.parse(templateName)}
  catch (e) {} // eslint-disable-line

  const template = this.templates[templateName]
  if (!template) return callback(new Error(`Unrecognized template: ${templateName}`))

  const options = this.renderOptions ? this.renderOptions(req, templateName) : {}

  if (template.$raw) {
    return template(json, options, (err, renderedJson) => {
      if (err) return callback(err)
      callback(null, stripRev(renderedJson))
    })
  }

  const models = _.isArray(json) ? _.map(json, (modelJson) => new this.model_type(this.model_type.prototype.parse(modelJson))) : new this.model_type(this.model_type.prototype.parse(json))
  JSONUtils.renderTemplate(models, template, options, callback)
}
