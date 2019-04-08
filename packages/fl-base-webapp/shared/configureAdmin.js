import _ from 'lodash' // eslint-disable-line
import admin from 'fl-admin'
import MarkdownInput from './modules/utils/components/MarkdownInput'

export default function configureAdmin() {
  admin({
    models: [
      {
        Model: require('./models/User'),
        display: model => model.email,
        searchFields: ['email'],
        fields: {
          admin: {
            listDisplay: true,
          },
        },
      },
      {
        Model: require('./models/Profile'),
        query: {$include: 'user'},
        display: model => model.displayName,
        fields: {
          user: {
            label: 'Email',
            readOnly: true,
            display: profile => profile.user.email,
          },
        },
      },
      {
        Model: require('./models/AppSettings'),
        singleton: true,
        fields: {
          landingPageImage: {
            input: 'image',
          },
          footerContactInfo: {
            input: 'textarea',
          },
        },
      },
      {
        Model: require('./models/StaticPage'),
        fields: {
          title: {
            listEdit: true,
          },
          contentMd: {
            InputComponent: MarkdownInput,
          },
        },
      },
    ],
  })
}
