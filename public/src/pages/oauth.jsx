import { navigate } from 'gatsby'
import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import Loading from '../components/Loading'
import { GlobalContext } from '../contexts/GlobalContext'
import { Helmet } from 'react-helmet'

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

function OAuthHandler({ location }) {
  const { isConfigLoaded, setDidOAuthComplete } = useContext(GlobalContext)

  useEffect(() => {
    if(!isConfigLoaded) return
    async function completeLogin() {
      console.log("completeLogin")
      let {search, hash} = window.location
      search = search.replace("?", "")
      let query = {}
      search.split("&").forEach(el => {
        let split = el.split("=")
        query[split[0]] = split[1]
      })

      let state
      hash = hash.replace("#", "")
      let hashMap = {}
      hash.split("&").forEach(el => {
        let split = el.split("=")
        hashMap[split[0]] = split[1]
      })

      if(hashMap["state"]) {
        state = hashMap["state"]
      }

      const { ForgeClient } = window.services
      let res = await fetch(`${ForgeClient.config.apiBase}/oauth/code`, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: query.code
        })
      })
      let json = await res.json()
      if(json.error) {
        throw `Error logging in ${json.error}`
      }
      json.issuedAt = Date.now()

      localStorage.setItem("auth", JSON.stringify(json))
      await ForgeClient.setAuthData(json, {
        fetchUserData: true
      })

      setDidOAuthComplete(true)

      if(state) {
        state = decodeURIComponent(state)
        navigate(state)
      } else {
        navigate("/")
      }
    }
    completeLogin()
  }, [isConfigLoaded])

  return (
    <Wrapper>
      <Helmet>
        <title>Signing In - GuardianForge</title>
      </Helmet>
      <Loading />
    </Wrapper>
  )
}

export default OAuthHandler
