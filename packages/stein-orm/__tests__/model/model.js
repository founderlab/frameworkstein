import _ from 'lodash'
import { createModel, Model, Schema } from '../../src/'


class MockStore {
  constructor(options) {
    _.extend(this, options)
  }
}

describe('Model', () => {

  it('is initialised by decorator', () => {
    const tmpUrl = 'tmpUrl'

    class SubModel extends Model {
      static store = new MockStore({
        url: tmpUrl,
      })
    }

    const DecoratedModel = createModel({
      schema: {
        prop: 'Text',
      },
    })(SubModel)

    const instance = new DecoratedModel()

    _.forEach([DecoratedModel, instance], target => {
      expect(target.name).toBe('SubModel')
      expect(target.store.url).toBe(tmpUrl)
      expect(target.store instanceof MockStore).toBeTruthy()
      expect(target.schema instanceof Schema).toBeTruthy()
    })
  })

  it('can declare options as static properties', () => {
    const tmpUrl = 'tmpUrl'

    class SubModel extends Model {
      static store = new MockStore({
        url: tmpUrl,
      })
      static schema = {
        staticProp: 'Text',
      }
    }

    const DecoratedModel = createModel()(SubModel)

    const instance = new DecoratedModel()

    _.forEach([DecoratedModel, instance], target => {
      expect(target.name).toBe('SubModel')
      expect(target.store.url).toBe(tmpUrl)
      expect(target.store instanceof MockStore).toBeTruthy()
      expect(target.schema instanceof Schema).toBeTruthy()
      expect(target.schema.fields.staticProp.type).toBe('Text')
    })
  })

})
