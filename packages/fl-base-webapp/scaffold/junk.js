import _ from 'lodash' // eslint-disable-line
import Profile from '../server/models/Profile'

export default function junk(callback) {
  const query =  {
    visible: true,
    $verbose: true,
  }

  Profile.cursor(query).toJSON((err, profiles) => {
    if (err) return callback(err)
    console.log(profiles.map(p => p.displayName+' | '+p.tag_ids))
    callback()
  })
}