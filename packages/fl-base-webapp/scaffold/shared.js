import _ from 'lodash'
import Queue from 'queue-async'
import StaticPage from '../server/models/StaticPage'
import User from '../server/models/User'
import AppSettings from '../server/models/AppSettings'

const defaults = {
  appSettings: {
    facebookUrl: 'https://facebook.com/',
    twitterUrl: 'https://twitter.com/',
    instagramUrl: 'https://instagram.com/',
    footerContactInfo: `
      XX Fake st<br />
      Sydney<br />
      NSW 2000<br />
      Australia`,
  },
  staticPages: [
    {title: 'About Us'},
    {title: 'FAQ'},
    {title: 'Privacy', slug: 'privacy'},
    {title: 'Terms of service', slug: 'terms'},
  ],
}

const models = {}

export default function scaffold(_toScaffold, callback) {
  const toScaffold = _.extend(defaults, _toScaffold)
  const queue = new Queue(1)
  models.users = {}

  _.forEach(toScaffold.users, (_user, key) => {
    queue.defer(callback => {
      console.log('Creating user', _user.profile.displayName)
      User.findOne({email: _user.email}, (err, existingUser) => {
        if (err) return callback(err)
        if (existingUser) {
          models[key] = existingUser
          return callback()
        }
        const user = new User(_user)
        models.users[key] = user
        user.set({password: User.createHash(user.get('password'))})
        user.save(callback)
      })
    })
  })

  queue.defer(callback => AppSettings.findOrCreate(toScaffold.appSettings, callback))

  models.staticPages = []
  _.forEach(toScaffold.staticPages, (_staticPage, i) => {
    queue.defer(callback => {
      console.log('Creating page', _staticPage.title)
      const pageDefaults = {visible: true, showInFooter: true, order: i, slug: StaticPage.slugify(_staticPage.title)}
      const staticPage = new StaticPage(_.extend(pageDefaults, _staticPage))
      models.staticPages.push(staticPage)
      staticPage.save(callback)
    })
  })

  queue.await(err => callback(err, models))
}
