/* eslint-disable
    import/no-unresolved,
    new-cap,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let JoinTableController
const {_, JSONUtils} = require('backbone-orm')

const RestController = require('../rest_controller')

module.exports = (JoinTableController = class JoinTableController extends RestController {

  create(req, res) {
    try {
      let json = JSONUtils.parseDates(this.whitelist.create ? _.pick(req.body, this.whitelist.create) : req.body)

      return this.model_type.exists(json, (err, exists) => {
        if (err) { return this.sendError(res, err) }
        if (exists) { this.sendStatus(res, 409, 'Entry already exists') }

        const model = new this.model_type(this.model_type.prototype.parse(json))

        const event_data = {req: res, res, model}
        this.constructor.trigger('pre:create', event_data)

        return model.save(err => {
          if (err) { return this.sendError(res, err) }

          event_data.model = model
          json = this.whitelist.create ? _.pick(model.toJSON(), this.whitelist.create) : model.toJSON()
          return this.render(req, json, (err, json) => {
            if (err) { return this.sendError(res, err) }
            this.constructor.trigger('post:create', _.extend(event_data, {json}))
            return res.json(json)
          })
        })
      })

    }
    catch (error) {
      const err = error
      return this.sendError(res, err)
    }
  }
})
