import _ from 'lodash' // eslint-disable-line
import request from 'superagent'
import Profile from '../../models/Profile'
import Tag from '../../models/Tag'
import LookingFor from '../../models/LookingFor'
import Link from '../../models/Link'
import MentorLink from '../../models/MentorLink'


// These actions are for user profiles
// For user actions see ../users/actions
// Profiles are created by the User model on the server when a new user registers

export const TYPES = {
  ACTIVE_PROFILE_SET: 'ACTIVE_PROFILE_SET',
  PROFILE_LOAD: 'PROFILE_LOAD',
  PROFILE_COUNT: 'PROFILE_COUNT',
  PROFILE_SAVE: 'PROFILE_SAVE',
  TAG_LOAD: 'TAG_LOAD',
  LOOKING_FOR_LOAD: 'LOOKING_FOR_LOAD',
  GEO_IP_LOAD: 'GEO_IP_LOAD',
  PROFILE_PLACE_LOAD: 'PROFILE_PLACE_LOAD',
  MENTOR_SAVE: 'MENTOR_SAVE',
  MENTOR_DELETE: 'MENTOR_DELETE',
  MENTOR_LINK_SAVE: 'MENTOR_LINK_SAVE',
  MENTOR_LINK_LOAD: 'MENTOR_LINK_LOAD',
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

export function loadTags() {
  return {
    type: TYPES.TAG_LOAD,
    request: Tag.cursor({}),
  }
}

export function loadLookingFors() {
  return {
    type: TYPES.LOOKING_FOR_LOAD,
    request: LookingFor.cursor({}),
  }
}

export function loadGeoIp(url) {
  return {
    type: TYPES.GEO_IP_LOAD,
    request: request.get(`${url}/api/locate`),
  }
}

export function loadPlaces(urlRoot) {
  return {
    type: TYPES.PROFILE_PLACE_LOAD,
    request: request.get(`${urlRoot}/api/places/profiles`),
  }
}

export function loadAdvisorProfiles(orgId, userId) {
  return {
    type: TYPES.PROFILE_LOAD,
    advisors: true,
    request: callback => {
      Link.cursor({organisation_id: orgId, advisor: true, $user_id: userId}).values('user_id').toJSON((err, userIds) => {
        if (err) return callback(err)
        Profile.cursor({user_id: {$in: userIds}, $user_id: userId}).toJSON(callback)
      })
    },
  }
}

export function saveMentorLink(mentorLink) {
  const model = new MentorLink(mentorLink)
  return {
    type: TYPES.MENTOR_LINK_SAVE,
    request: model.save.bind(model),
  }
}

export function loadActiveUserMentorLinks(query) {
  return {
    type: TYPES.MENTOR_LINK_LOAD,
    active: true,
    request: MentorLink.cursor(query),
  }
}

export function loadMentorLinks(query) {
  return {
    type: TYPES.MENTOR_LINK_LOAD,
    request: MentorLink.cursor(query),
  }
}
