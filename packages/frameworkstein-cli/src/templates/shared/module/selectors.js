export default options =>
`import { createSelector } from 'reselect'


export function _select${options.className}(${options.variablePlural}, params) {
  const ${options.variableName}Im = ${options.variablePlural}.get('models').get(params.id)
  if (!${options.variableName}Im) return null

  return ${options.variableName}Im.toJSON()
}
const select${options.className} = createSelector(
  [
    state => state.${options.variablePlural},
    (_, props) => {
      if (!props.match) console.log('[select${options.className}] missing props.match, you need to use @withRouter to provide route info')
      return props.match && props.match.params
    },
  ],
  _select${options.className},
)

export function _select${options.classPlural}Error(${options.variablePlural}, errorType) {
  const err = ${options.variablePlural}.get('errors') && ${options.variablePlural}.get('errors').get(errorType)
  if (err) return err.toString()
  return null
}
const select${options.classPlural}Error = createSelector(
  [
    state => state.${options.variablePlural},
    (_, errorType) => errorType,
  ],
  _select${options.classPlural}Error,
)

export { select${options.className}, select${options.classPlural}Error }
`
