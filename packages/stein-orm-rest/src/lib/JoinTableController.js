/* eslint-disable
    new-cap,
*/
import _ from 'lodash'
import { parseDates } from './parsers'
import RestController from '../RestController'


export default class JoinTableController extends RestController {

  create(req, res) {
    try {
      let json = parseDates(this.whitelist.create ? _.pick(req.body, this.whitelist.create) : req.body)

      return this.modelType.exists(json, (err, exists) => {
        if (err) return this.sendError(res, err)
        if (exists) { this.sendStatus(res, 409, 'Entry already exists') }

        const model = new this.modelType(json)

        return model.save(err => {
          if (err) return this.sendError(res, err)

          json = this.whitelist.create ? _.pick(model.toJSON(), this.whitelist.create) : model.toJSON()
          return this.render(req, json, (err, json) => {
            if (err) return this.sendError(res, err)

            this.events.emit('create', {req, res, model, json})
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
}
