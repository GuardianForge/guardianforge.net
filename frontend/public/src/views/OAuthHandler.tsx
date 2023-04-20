import { useNavigate } from 'react-router-dom'
import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import Loading from '../components/Loading'
import { GlobalContext } from '../contexts/GlobalContext'
import { Helmet } from 'react-helmet'
import AlertDetail from '../models/AlertDetail'
import MainLayout from '../layouts/MainLayout'

function OAuthHandler() {
  const navigate = useNavigate()
  const { isConfigLoaded, dispatchAlert, completeLogin } = useContext(GlobalContext)

  useEffect(() => {
    if(!isConfigLoaded) return
    async function handleCode() {
      let { search } = window.location
      search = search.replace("?", "")
      let query = {}
      search.split("&").forEach(el => {
        let split = el.split("=")
        // @ts-ignore
        query[split[0]] = split[1]
      })

      let nextState = localStorage.getItem("nextState")

      // @ts-ignore
      await completeLogin(query.code)

      if(nextState && !nextState.startsWith("/oauth")) {
        localStorage.removeItem("nextState")
        navigate(nextState)
      } else {
        navigate("/")
      }
    }

    try {
      handleCode()
    } catch (err) {
      let alert = new AlertDetail("An error occurred while logging in. Please try again later...", "Login Error", true, false)
      dispatchAlert(alert)
    }
  }, [isConfigLoaded])

  return (
    <MainLayout>
      <Helmet>
        <title>Signing In - GuardianForge</title>
      </Helmet>
      <div className="flex items-center justify-center">
        <Loading />
      </div>
    </MainLayout>
  )
}

export default OAuthHandler
