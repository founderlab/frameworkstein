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
  const { store, branch, action, location, parallelism } = _.defaults(options, defaults)
  const result = {}
  const queue = new Queue(parallelism)

  return new Promise((resolve, reject) => {
    branch.forEach(branch => {
      let Component = branch.route.component
      if (!Component) return

      while (Component.WrappedComponent) {
        Component = Component.WrappedComponent
      }
      if (!Component.fetchData) return

      const match = branch.match

      queue.defer(callback => {
        const done = (err, res={}) => {
          if (res) _.extend(result, res)
          callback(err)
        }
        const promise = Component.fetchData({store, action, match, location}, done)
        if (promise) {
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
