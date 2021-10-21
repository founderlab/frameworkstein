
// Executes fetchdata on a component, handles async or callback formats
function executeFetch(Component, executeFetchOpts) {
  return new Promise((resolve, reject) => {
    let done = false
    const p = Component.fetchData(executeFetchOpts, (err, res) => {
      if (done) return
      done = true
      if (err && res && !err.status) {
        err.status = res.status
      }
      if (err) return reject(err)
      resolve(res)
    })
    if (p && p.then) {
      p.then(res => {
        if (done) return
        done = true
        resolve(res)
      }).catch(err => {
        if (done) return
        done = true
        reject(err)
      })
    }
  })
}

async function _executeFetchComponentData(options) {
  const { store, action, parallel, ...rest } = options
  const promises = []
  let result = {}

  for (const branch of options.branch) {
    const { match, route } = branch
    let Component = route.component
    if (!Component) continue

    // load the component from @loadable/component if the module has a load method
    if (Component.load) {
      const componentModule = await Component.load()
      Component = componentModule.default
    }
    while (Component.WrappedComponent) {
      Component = Component.WrappedComponent
    }

    if (Component.fetchData) {
      const p = executeFetch(Component, {...rest, store, action, match, route})
      if (parallel) {
        promises.push(p)
      }
      else {
        const res = await p
        if (res) result = {...result, ...res}
      }
    }
  }

  if (parallel) {
    const results = await Promise.all(promises)
    for (const res of results) {
      if (res) result = {...result, ...res}
    }
  }

  return result
}

/*
 *  @param store the current redux store
 *  @param branch the matching react-router routes
 *  @param action the action that has triggered this executeFetch
 *  @param callback an optional callback, will return a promise if not provided
 */
export default async function fetchComponentData(options, callback) {
  try {
    const res = await _executeFetchComponentData(options)
    if (callback) return callback(null, res)
    return res
  }
  catch (err) {
    console.log(err)
    if (callback) return callback(err)
    throw err
  }
}
