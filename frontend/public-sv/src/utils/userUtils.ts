
// @ts-ignore TODO: Make a model from 'profile'
const parseMembershipFromProfile = function (profile: any) {
  let membershipType, membershipId, requiresPlatformSelect;
  if(profile && profile.destinyMemberships) {
    // Has one membership
    if(profile.destinyMemberships.length === 1) {
      membershipType = profile.destinyMemberships[0].membershipType
      membershipId = profile.destinyMemberships[0].membershipId
    }

    if(profile.primaryMembershipId) {
      membershipId = profile.primaryMembershipId
      // @ts-ignore TODO: Fix this
      profile.destinyMemberships.forEach(el => {
        if(el.membershipId === profile.primaryMembershipId) {
          membershipType = el.membershipType
        }
      })
    }

    if(profile.destinyMemberships.length > 1 && !profile.primaryMembershipId) {
      // @ts-ignore TODO: Fix this
      profile.destinyMemberships.forEach(el => {
        if(el.crossSaveOverride && el.crossSaveOverride === el.membershipType) {
          membershipType = el.membershipType
          membershipId = el.membershipId
        }
      })

      if(!membershipId || !membershipType) {
        requiresPlatformSelect = true
      }
    }
  }

  return {
    membershipType,
    membershipId,
    requiresPlatformSelect
  }
}

export default {
  parseMembershipFromProfile
}