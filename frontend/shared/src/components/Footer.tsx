import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenSquare, faBook, faCommentMedical } from '@fortawesome/free-solid-svg-icons'
import { faDiscord, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { Col, Row } from 'react-bootstrap'
import AppTypeEnum from '../models/AppTypeEnum'

const Wrapper = styled.div`
  border-top: 1px solid #333;
  margin-top: 20px;
  padding-top: 20px;
  max-width: 960px !important;

  .footer-col {
    margin-bottom: 30px;
  }

  .footer-header {
    font-weight: bold;
    padding-bottom: 10px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    color: #ccc;

    div {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
    }

    svg {
      margin-right: 5px;
    }
  }
`

export interface Props {
  appType: AppTypeEnum
  extraPadding?: boolean
  linkComponent: React.ElementType
}

function Footer(props: Props) {
  const { appType, extraPadding, linkComponent: LinkComponent } = props

  console.log("apptype", appType)

  return (
    <Wrapper className="container" style={{ paddingBottom: extraPadding ? "120px" : "0px"}}>
      <Row>
        <Col md={4} className="footer-col">
          <div className="footer-header">Info</div>
          <div className="footer-content">
            <FontAwesomeIcon icon={faPenSquare} /> {appType === AppTypeEnum.Blog ? <LinkComponent to="/blog">Blog </LinkComponent> : <a href="/blog">Blog </a>}
            <FontAwesomeIcon icon={faBook} /> {appType === AppTypeEnum.Docs ? <LinkComponent to="/docs">Docs </LinkComponent> : <a href="/docs">Docs </a>}
            <FontAwesomeIcon icon={faBook} /> {appType === AppTypeEnum.App ? <LinkComponent to="/about">About </LinkComponent> : <a href="/about">About </a>}
            {/* <!-- <div><FontAwesomeIcon icon="history" /> <g-link to="/changelog"> Changelog </g-link></div> --> */}
            <FontAwesomeIcon icon={faCommentMedical} /> <a href="https://forms.gle/5i8BG34h6Kv5F7zk9" target="_blank" rel="noreferrer"> Give Feedback </a>
          </div>
        </Col>
        <Col md={4} className="footer-col">
          <div className="footer-header">Connect</div>
          <div className="footer-content">
            <FontAwesomeIcon icon={faDiscord} /> <a href="https://discord.gg/tctVKqXG6g" target="_blank" rel="noreferrer">Discord</a>
            <FontAwesomeIcon icon={faTwitter} /> <a href="https://twitter.com/guardianforge" target="_blank" rel="noreferrer">Twitter</a>
            <FontAwesomeIcon icon={faInstagram} /> <a href="https://www.instagram.com/guardianforge" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </Col>
        <Col md={4} className="footer-col">
          <div className="footer-header">Support</div>
          <div>
            <p>GuardianForge was made by <a href="https://twitter.com/brianmmdev" target="_blank" rel="noreferrer">@brianmmdev</a></p>
            <p>If you would like to support the development of Forge, please consider <a href="https://www.buymeacoffee.com/brianmmdev" target="_blank" rel="noreferrer">buying me a coffee</a>!</p>
          </div>
        </Col>
      </Row>
    </Wrapper>
  )
}

export default Footer
