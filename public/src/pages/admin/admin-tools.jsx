import React, { useState } from 'react'
import userUtils from "../../utils/userUtils"

function AdminTools() {
  const [userIdToImpersonate, setUserIdToImpersonate] = useState("")

  async function impersonateUser() {
    const { ForgeClient, BungieApiService } = window.services

    // const user = await BungieApiService.fetchBungieUser(userIdToImpersonate)
    let userData = await BungieApiService.fetchUserMemberships(userIdToImpersonate)
    ForgeClient.userData = userData
    let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(userData)

    let charRes = await BungieApiService.fetchCharactersList(membershipType, membershipId)

    let guardians = Object.keys(charRes.characters.data).map(key => charRes.characters.data[key])
    guardians.sort((a, b) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))

    ForgeClient.userGuardians = guardians
  }

  return (
    <div>
      <h1>Admin Tools</h1>
      <h2>Impersonate User</h2>
      <div className="row g-3">
        <div className="col-auto">
          <input type="text"
            className="form-control"
            placeholder="membershipId"
            value={userIdToImpersonate}
            onChange={e => setUserIdToImpersonate(e.target.value)} />
        </div>
        <div className="col-auto">
          <button onClick={impersonateUser} className="btn btn-primary mb-3">Impersonate</button>
        </div>
      </div>
    </div>
  )
}

export default AdminTools
