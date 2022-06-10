import React, { useEffect, useState, useContext, ReactNode } from 'react'
import styled from 'styled-components'

import MainNav from '../components/nav/MainNav'
import Footer from '../components/Footer'
import { GlobalContext } from '../contexts/GlobalContext'
import AlertLayer from '../components/alerting/AlertLayer'
import { Helmet } from 'react-helmet'
import { Alert } from 'react-bootstrap'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #14151a !important;
  }
`

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

type Props = {
  wide?: boolean
  children: ReactNode
}

function MainLayout(props: Props) {
  const { wide, children } = props
  const { isInitDone, initApp, bannerMessage } = useContext(GlobalContext)

  // const data = useStaticQuery(graphql`
  //   query MainLayoutQuery {
  //     site {
  //       siteMetadata {
  //         siteUrl
  //         title,
  //         siteDescription
  //       }
  //     }
  //   }
  // `)

  useEffect(() => {
    initApp()
  }, [isInitDone])

  return (
    <Wrapper>
      <GlobalStyle />
      {/* <Helmet>
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
      </Helmet> */}
      <MainNav />
      <Main className={wide ? "container-fluid" : "container"}>
        {children}
      </Main>
      <Footer extraPadding={(bannerMessage && bannerMessage !== "") ? true : false} />

      {bannerMessage && (
        <div style={{
          width: "100vw",
          position: "fixed",
          bottom: "1",
          // top: "90%",
          // left: "50%",
          // transform: "translate(-50%, -50%)",
          // padding: ".5rem 1rem",
          padding: "0px 20px",
          zIndex: 10000
        }}>
          <Alert variant="warning">
            {bannerMessage}
          </Alert>
        </div>
      )}

      <AlertLayer />
    </Wrapper>
  )
}

export default MainLayout
