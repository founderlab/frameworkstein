import TestModel from '../models/TestModel'

import { modelSaveChain } from '../utils'

module.exports = {
  up: (callback) => {
    const newModels = [
      {myTextField: 'blah3', myIntegerField: 333},
      {myTextField: 'blah4', myIntegerField: 444},
    ]

    let promiseChain = Promise.resolve([])
    newModels.forEach(attributes => {
      promiseChain = promiseChain.then(results => modelSaveChain(new TestModel(attributes), results))
    })

    promiseChain.then(results => callback(null, results)).catch(err => callback(err))
  },
}
