import { createSelector } from 'reselect'


export function _selectTestModel(testModels, params) {
  const testModelIm = testModels.get('models').get(params.id)
  if (!testModelIm) return null

  return testModelIm.toJSON()
}
const selectTestModel = createSelector(
  [
    state => state.testModels,
    (_, props) => {
      if (!props.match) console.log('[selectTestModel] missing props.match, you need to use @withRouter to provide route info')
      return props.match && props.match.params
    },
  ],
  _selectTestModel,
)

export { selectTestModel }
