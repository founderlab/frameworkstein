import TestModel from '../../models/TestModel'

export const TYPES = {
  TEST_MODEL_SAVE: 'TEST_MODEL_SAVE',
  TEST_MODEL_LOAD: 'TEST_MODEL_LOAD',
  TEST_MODEL_DELETE: 'TEST_MODEL_DELETE',
}

export function saveTestModel(group) {
  const model = new TestModel(group)
  return {
    type: TYPES.TEST_MODEL_SAVE,
    request: model.save.bind(model),
  }
}

export function loadTestModels(query) {
  query.$sort = '-createdDate'
  return {
    type: TYPES.TEST_MODEL_LOAD,
    request: TestModel.cursor(query),
  }
}

export function deleteTestModel(data) {
  const model = new TestModel(data)
  return {
    type: TYPES.TEST_MODEL_DELETE,
    request: model.destroy.bind(model),
    deletedModel: data,
  }
}
