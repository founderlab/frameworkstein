import _ from 'lodash'


export default options =>
`import _ from 'lodash' // eslint-disable-line
import admin from 'fl-admin'

export default function configureAdmin() {
  admin({
    models: [
      {
        Model: require('./models/User'),
        display: model => model.email,
        searchFields: ['email'],
        fields: {
          id: {
            listDisplay: true,
          },
          admin: {
            listDisplay: true,
          },
        },
      },
      {
        Model: require('./models/Profile'),
        query: {$include: 'user'},
        display: model => model.nickname,
        searchFields: ['nickname'],
        fields: {
          user: {
            linked: true,
          },
        },
      },
${_.map(options.modelOptions, options => {
  return `
    {
      Model: require('./models/MeetingRequest'),
      fields: {
      },
    },
  `
})}
    ],
  })
}
`
