import _ from 'lodash' // eslint-disable-line
import Profile from '../../models/Profile'


// These actions are for user profiles
// For user actions see ../users/actions
// Profiles are created by the User model on the server when a new user registers

export const TYPES = {
  ACTIVE_PROFILE_SET: 'ACTIVE_PROFILE_SET',
  PROFILE_LOAD: 'PROFILE_LOAD',
  PROFILE_COUNT: 'PROFILE_COUNT',
  PROFILE_SAVE: 'PROFILE_SAVE',
}

export function loadProfiles(query) {
  return {
    type: TYPES.PROFILE_LOAD,
    request: Profile.cursor(query),
  }
}

export function loadActiveProfile(query) {
  query.$one = true
  return {
    type: TYPES.PROFILE_LOAD,
    active: true,
    request: Profile.cursor(query),
  }
}

export function setActiveProfile(profile) {
  return {
    type: TYPES.ACTIVE_PROFILE_SET,
    profile,
  }
}

export function save(profile) {
  const model = new Profile(profile)
  return {
    type: TYPES.PROFILE_SAVE,
    request: model.save.bind(model),
  }
}

export function count(query) {
  return {
    type: TYPES.PROFILE_COUNT,
    request: Profile.cursor(_.merge({}, query, {$count: true})),
  }
}

export function loadPage(page, query) {
  return {
    page,
    type: TYPES.PROFILE_LOAD,
    request: Profile.cursor(query),
  }
}
