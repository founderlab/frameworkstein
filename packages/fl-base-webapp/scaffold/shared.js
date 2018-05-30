import _ from 'lodash'
import Queue from 'queue-async'
import StaticPage from '../server/models/StaticPage'
import User from '../server/models/User'
import Profile from '../server/models/Profile'
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

export default async function scaffold(_toScaffold, callback) {
  const toScaffold = _.extend(defaults, _toScaffold)
  models.users = {}

  _.forEach(toScaffold.users, async (_user, key) => {
    console.log('Creating user', _user.profile.displayName)
    try {
      const existingUser = await User.findOne({email: _user.email})
      if (existingUser) {
        models[key] = existingUser
      }
      else {
        const { profile, ...__user } = _user
        const user = new User(__user)
        models.users[key] = user
        await user.save({password: User.createHash(user.get('password'))})

        const profileModel = new Profile(profile)
        await profileModel.save({user_id: user.id})
      }
    }
    catch (err) {
      return callback(err)
    }
  })

  await AppSettings.findOrCreate(toScaffold.appSettings)

  models.staticPages = []
  _.forEach(toScaffold.staticPages, async (_staticPage, i) => {
    try {
      console.log('Creating page', _staticPage.title)
      const pageDefaults = {visible: true, showInFooter: true, order: i, slug: StaticPage.slugify(_staticPage.title)}
      const staticPage = new StaticPage(_.extend(pageDefaults, _staticPage))
      models.staticPages.push(staticPage)
      await staticPage.save()
    }
    catch (err) {
      return callback(err)
    }
  })

  callback(null, models)
}
