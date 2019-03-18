/* eslint-disable
    prefer-const,
    no-unused-vars,
*/
import _ from 'lodash'
import { fromJS } from 'immutable'
import { updateModel, removeModel } from '../src'


// profiles reducer
const mockProfile = {
  id: '1',
  user_id: '1',
  displayName: 'Bob Burger',
}

let mockProfileReducer


describe('RestController', () => {

  beforeEach(async () => {
    mockProfileReducer = fromJS({
      models: {
        [mockProfile.id]: mockProfile,
      },
      modelList: [mockProfile],
    })
  })

  it('updateModel updates a model', async () => {
    const newProfile = {
      id: '1',
      name: 'Not Bob',
    }

    const newState = updateModel(mockProfileReducer, newProfile)

    const updatedModel = newState.get('models').get(newProfile.id).toJSON()
    expect(updatedModel.name).toEqual(newProfile.name)

    const updatedModelList = newState.get('modelList').toJSON()
    expect(updatedModelList[0].name).toEqual(newProfile.name)
  })

  it('removeModel removes a model', async () => {
    const deletedId = '1'

    const newState = removeModel(mockProfileReducer, deletedId)

    const deletedModel = newState.get('models').get(deletedId)
    expect(deletedModel).toBeFalsy()

    const updatedModelList = newState.get('modelList').toJSON()
    expect(updatedModelList.length).toEqual(0)
  })

})
