import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'

import MainNav from '../components/nav/MainNav'
import Footer from '../components/Footer'
import { GlobalContext } from '../contexts/GlobalContext'
import AlertLayer from '../components/alerting/AlertLayer'
import BetaModal from '../components/BetaModal'
import { useStaticQuery, graphql } from 'gatsby'
import { Helmet } from 'react-helmet'
import "./MainLayout.css"

const Main = styled.div`
  max-width: 960px !important;
  min-height: calc(100vh - 160px);

  h1 {
    margin-top: 20px !important;
  }
`

const Wrapper = styled.div`
  #app {
    flex-direction: column;
    align-items: center;
    height: 100vh; }

  .build-mode .highlightable {
    border: 2px solid yellow;
    animation: border-pulsate 2s infinite;
    cursor: pointer; }

  .build-mode img.highlighted, #build img.highlighted, .build-mode .light-tree-perk-wrapper.highlighted, #build .light-tree-perk-wrapper.highlighted {
    border: 3px solid yellow;
    animation: none !important; }

  @keyframes border-pulsate {
    0% {
      border-color: yellow; }
    50% {
      border-color: rgba(255, 255, 0, 0.1); }
    100% {
      border-color: yellow; } }

  .btn-secondary {
    background-color: #444 !important;
    border-color: #333 !important; }

  .beta-modal {
    color: #111; }
`

function MainLayout({ wide, children }) {
  const { isInitDone, initApp } = useContext(GlobalContext)

  const data = useStaticQuery(graphql`
    query MainLayoutQuery {
      site {
        siteMetadata {
          siteUrl
          title,
          siteDescription
        }
      }
    }
  `)

  useEffect(() => {
    initApp()
  }, [isInitDone])

  return (
    <Wrapper>
      <Helmet>
        <title>GuardianForge</title>
        <meta property="og:image" content={`${data.site.siteMetadata.siteUrl}/img/social.png`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GuardianForge" />
        <meta property="og:description" content={data.site.siteMetadata.siteDescription} />
        <meta property="og:url" content={data.site.siteMetadata.siteUrl} />
        <meta property="og:site_name" content="GuardianForge" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="GuardianForge" />
        <meta property="twitter:site" content="@guardianforge" />
        <meta property="twitter:creator" content="@guardianforge" />
        <meta property="twitter:description" content={data.site.siteMetadata.siteDescription} />
      </Helmet>
      <MainNav />
        <Main className={wide ? "container-fluid" : "container"}>
          {children}
        </Main>
      <Footer />

      <AlertLayer />
      <BetaModal />
    </Wrapper>
  )
}

export default MainLayout
