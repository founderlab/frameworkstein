/* eslint-disable
    func-names,
    import/no-unresolved,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
const express = require('express')
const bodyParser = require('body-parser')

module.exports = function() {
  const app = express()
  app.use(bodyParser.json())
  return app
}

global.__test__app_framework = {factory: module.exports, name: require('path').basename(module.id, '.coffee')}
