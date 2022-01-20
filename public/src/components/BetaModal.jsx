import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { navigate } from 'gatsby'
import styled from 'styled-components'

const Wrapper = styled.div`
  color: #111;
`

function BetaModal() {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    setTimeout(function () {
      let isAccepted = localStorage.getItem("betaModalAccepted")
      if(!isAccepted) {
        setIsShowing(true)
      }
    }, 500)
  }, [])

  function acceptAndHide() {
    localStorage.setItem("betaModalAccepted", true)
    setIsShowing(false)
  }

  function acceptAndGoToAbout() {
    acceptAndHide()
    navigate("/about")
  }

  return (
    <Modal show={isShowing}>
      <Wrapper>
        <Modal.Header>
          <Modal.Title>Welcome</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            I greet you in the light...Welcome to the GuardianForge Beta! Please note that this is an early release of the platform. Some features may not work as expected while it is being built. Also, expect the site to change over time as more features are added. Thanks for checking it out!
          </p>
          <p><i>- Brian (<a href="https://twitter.com/brianmmdev" target="_blank">@brianmmdev</a>)</i></p>
          <p>
            Check the About page for info on creating builds, and a preview of whats to come;
          </p>
          <ul>
            <li><a className="btn-link" onClick={acceptAndGoToAbout}>About GuardianForge</a></li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={acceptAndHide}>Close</Button>
        </Modal.Footer>
      </Wrapper>
    </Modal>
  )
}

export default BetaModal
