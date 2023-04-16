import { useEffect, useContext, ReactNode } from 'react'
import styled from 'styled-components'

import MainNav from '../components/nav/MainNav'
import { GlobalContext } from '../contexts/GlobalContext'
import AlertLayer from '../components/alerting/AlertLayer'
import { Alert } from 'react-bootstrap'
import Footer from '../components/ui/Footer2'

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

  useEffect(() => {
    initApp()
  }, [isInitDone])

  return (
    <Wrapper>
      <MainNav />
      <div className="max-w-[960px] min-h-[calc(100vh-112px)] mx-auto px-2">
        {children}
      </div>
      <Footer />

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
