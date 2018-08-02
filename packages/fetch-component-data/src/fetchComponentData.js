import _ from 'lodash' // eslint-disable-line
import Queue from 'queue-async'


const defaults = {
  parallelism: 1,
}

/*
 *  @param store the current redux store
 *  @param branch the matching react-router routes
 *  @param action the action that has triggered this fetch
 *  @param parallelism the number of fetches to execute in parallel
 */
export default function fetchComponentData(options, callback) {
  return new Promise((resolve, reject) => {
    const { store, branch, action, location, parallelism } = _.defaults(options, defaults)
    const result = {}
    const queue = new Queue(parallelism)

    branch.forEach(branch => {

      let Component = branch.route.component
      if (!Component) return callback()

      while (Component.WrappedComponent) {
        Component = Component.WrappedComponent
      }
      if (!Component.fetchData) return

      queue.defer(callback => {
        const match = branch.match

        // It's possible for compoennts to both call a callback fn and return a promise, in this case
        // we need to make sure we don't call our queue callback again
        let called = false
        const done = (err, res={}) => {
          if (called) {
            console.log(`[fetchData] ${Component.name} has returned a promise in addition to calling the provided callback, this may mean some data was not loaded correctly (use one or the other)`)
            return
          }
          called = true
          if (res) _.extend(result, res)
          callback(err)
        }

        let promise
        try {
          promise = Component.fetchData({store, action, match, location}, done)
        }
        catch (err) {
          return done(err)
        }

        if (promise && promise.then) {
          promise.then(res => done(null, res)).catch(err => done(err))
        }
      })
    })

    queue.await(err => {
      if (callback) callback(err, result)
      if (err) reject(err)
      else resolve(result)
    })
  })
}
