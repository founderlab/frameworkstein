import _ from 'lodash' // eslint-disable-line
import Queue from 'queue-async'
import moment from 'moment'


const toScaffold = {
  users: {
    adminUser: {
      email: 'admin@frameworkstein.com',
      admin: true,
      password: 'password',
      profile: {
        displayName: 'admin person',
        firstName: 'admin',
        lastName: 'lname',
        visible: false,
      },
    },
    normalUser: {
      email: 'entrepreneur@frameworkstein.com',
      password: 'password',
      profile: {
        displayName: 'entrepreneur person',
        firstName: 'entrepreneur',
        lastName: 'lname',
        visible: false,
      },
    },
  },
}

const models = {}

export default function scaffold(callback) {
  const queue = new Queue(1)

  queue.defer(callback => {
    require('./shared')(toScaffold, (err, _models) => callback(err, _.extend(models, _models)))
  })

  queue.await(err => callback(err, models))
}
