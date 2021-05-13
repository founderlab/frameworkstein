/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import expect from 'expect'
import { spy } from 'sinon'
import { createResponseParserMiddleware } from '../src'


function createJSONSpy(input) {
  return spy(action => {
    const inputList = _.isArray(input) ? input : [input]
    _.forEach(inputList, modelJson => {
      expect(action.models[modelJson.id]).toEqual(modelJson)
      expect(action.ids).toEqual(expect.arrayContaining([modelJson.id]))
    })
  })
}

function createModelSpy(model) {
  return spy(action => {
    expect(action.models[model.attributes.id]).toEqual(model.attributes)
  })
}

class Model {
  constructor(attrs) {
    this.attributes = attrs
  }
  toJSON() { return this.attributes }
}

describe('responseParserMiddleware', () => {

  it('Parses a single model as json', () => {
    const action = {
      res: {
        id: 'model1id',
        name: 'model1',
      },
    }
    const next = createJSONSpy(action.res)
    const middleware = createResponseParserMiddleware()
    middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

  it('Parses a list of json', () => {
    const action = {
      res: [
        {
          id: 'model1id',
          name: 'model1',
        },
        {
          id: 'model22222id',
          name: 'model22222',
        },
      ],
    }
    const next = createJSONSpy(action.res)
    const middleware = createResponseParserMiddleware()
    middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

  it('Parses a model-like thing', () => {
    const action = {
      res: new Model({
        id: 'model1id',
        name: 'model1',
      }),
    }
    const next = createModelSpy(action.res)
    const middleware = createResponseParserMiddleware()
    middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

  it('Parses a fetch response', async () => {
    const comparisonModel = {
      id: 'model1id',
      name: 'model1',
    }
    const action = {
      res: {
        json: () => ({
          ...comparisonModel,
        }),
      },
    }
    const next = createJSONSpy(comparisonModel)
    const middleware = createResponseParserMiddleware()
    await middleware()(next)(action)
    expect(next.calledOnce).toBeTruthy()
  })

})
