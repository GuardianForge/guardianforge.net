import { useNavigate } from 'react-router-dom'
import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import Loading from '../components/Loading'
import { GlobalContext } from '../contexts/GlobalContext'
import { Helmet } from 'react-helmet'
import AlertDetail from '../models/AlertDetail'
import MainLayout from '../layouts/MainLayout'

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

function OAuthHandler() {
  const navigate = useNavigate()
  const { isConfigLoaded, setDidOAuthComplete, dispatchAlert } = useContext(GlobalContext)

  useEffect(() => {
    if(!isConfigLoaded) return
    async function completeLogin() {
      let { search } = window.location
      search = search.replace("?", "")
      let query = {}
      search.split("&").forEach(el => {
        let split = el.split("=")
        // @ts-ignore
        query[split[0]] = split[1]
      })

      let nextState = localStorage.getItem("nextState")

      const { ForgeClient } = window.services

      // @ts-ignore
      await ForgeClient.completeLogin(query.code)
      setDidOAuthComplete(true)

      if(nextState && !nextState.startsWith("/oauth")) {
        localStorage.removeItem("nextState")
        navigate(nextState)
      } else {
        navigate("/")
      }
    }
    try {
      completeLogin()
    } catch (err) {
      console.error(err)
      let alert = new AlertDetail("An error occurred while logging in. Please try again later...", "Login Error", true, false)
      dispatchAlert(alert)
    }
  }, [isConfigLoaded])

  return (
    <MainLayout>
      <Wrapper>
        <Helmet>
          <title>Signing In - GuardianForge</title>
        </Helmet>
        <Loading />
      </Wrapper>
    </MainLayout>
  )
}

export default OAuthHandler
