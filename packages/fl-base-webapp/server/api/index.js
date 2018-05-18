import _ from 'lodash'
import path from 'path'
import { directoryFunctionModulesAsync } from 'fl-server-utils'

const controllers = {}

export default (options, callback) => {
  if (!options.app) throw new Error('Api init: Missing app from options')

  // create each controller from the controllers dir
  directoryFunctionModulesAsync(path.join(__dirname, './controllers'), (err, modules) => {
    if (err) return callback(err)

    _.forEach(modules, (Controller, path) => {
      controllers[path] = new Controller(options)
    })

    callback()
  })
}

export {controllers}
