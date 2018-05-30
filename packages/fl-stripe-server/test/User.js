import _ from 'lodash' // eslint-disable-line
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) console.log('Missing process.env.DATABASE_URL')

export default class User extends Backbone.Model {
  url = `${dbUrl}/users`
}

User.prototype.sync = smartSync(dbUrl, User)
