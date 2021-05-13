
async function _fetchComponentData(options) {
  const { store, action, location } = options
  const promises = []
  let result = {}

  for (const branch of options.branch) {
    const match = branch.match
    let Component = branch.route.component
    if (!Component) continue

    // load the component from @loadable/component if the module has a load method
    if (Component.load) {
      const componentModule = await Component.load()
      Component = componentModule.default
    }

    while (Component.WrappedComponent) {
      Component = Component.WrappedComponent
    }

    if (!Component.fetchData) continue

    promises.push(Component.fetchData({store, action, match, location}))
  }

  const results = await Promise.all(promises)
  for (const res of results) {
    if (res) result = {...result, ...res}
  }

  return result
}

/*
 *  @param store the current redux store
 *  @param branch the matching react-router routes
 *  @param action the action that has triggered this fetch
 *  @param callback an optional callback, will return a promise if not provided
 */
export default async function fetchComponentData(options, callback) {
  try {
    const res = await _fetchComponentData(options)
    if (callback) return callback(null, res)
    return res
  }
  catch (err) {
    console.log(err)
    if (callback) return callback(err)
    throw err
  }
}
