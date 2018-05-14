import _ from 'lodash' // eslint-disable-line
import Queue from 'queue-async'

const defaults = {
  parallelism: 1,
}

export default function fetchComponentData(options, callback) {
  const {store, components, action, parallelism} = _.defaults(options, defaults)
  const result = {}
  const queue = new Queue(parallelism)

  return new Promise((resolve, reject) => {
    components.forEach(Component => {
      if (!Component) return

      while (Component.WrappedComponent) {
        Component = Component.WrappedComponent
      }
      if (!Component.fetchData) return

      queue.defer(callback => {
        const done = (err, res={}) => {
          if (res) _.extend(result, res)
          callback(err)
        }
        const promise = Component.fetchData({store, action}, done)
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
