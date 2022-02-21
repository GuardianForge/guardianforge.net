import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'gatsby'

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

type Props = {
  extraPadding?: boolean
}

function Footer(props: Props) {
  const { extraPadding } = props

  return (
    <Wrapper className="container" style={{ paddingBottom: extraPadding ? "120px" : "0px"}}>
      <div className="row">
        <div className="col-md-4 footer-col">
          <div className="footer-header">Info</div>
          <div className="footer-content">
            <div><FontAwesomeIcon icon="pen-square" /> <Link to="/blog"> Blog </Link></div>
            {/* <!-- <div><FontAwesomeIcon icon="history" /> <g-link to="/changelog"> Changelog </g-link></div> --> */}
            <div><FontAwesomeIcon icon="book" /><Link to="/docs">Docs </Link></div>
            <div><FontAwesomeIcon icon="info-circle" /><Link to="/about">About </Link></div>
            <div>
              <FontAwesomeIcon icon="comment-medical" /> <a href="https://forms.gle/5i8BG34h6Kv5F7zk9" target="_blank" rel="noreferrer"> Give Feedback </a>
            </div>
          </div>
        </div>
        <div className="col-md-4 footer-col">
          <div className="footer-header">Connect</div>
          <div className="footer-content">
            <div><FontAwesomeIcon icon={['fab', 'discord']} /> <a href="https://discord.gg/tctVKqXG6g" target="_blank" rel="noreferrer">Discord</a></div>
            <div><FontAwesomeIcon icon={['fab', 'twitter']} /> <a href="https://twitter.com/guardianforge" target="_blank" rel="noreferrer">Twitter</a></div>
            <div><FontAwesomeIcon icon={['fab', 'instagram']} /> <a href="https://www.instagram.com/guardianforge" target="_blank" rel="noreferrer">Instagram</a></div>
          </div>
        </div>
        <div className="col-md-4 footer-col">
          <div className="footer-header">Support</div>
          <div className="footer-content">
            <p>GuardianForge was made by <a href="https://twitter.com/brianmmdev" target="_blank" rel="noreferrer">@brianmmdev</a></p>
            <p>If you would like to support the development of Forge, please consider <a href="https://www.buymeacoffee.com/brianmmdev" target="_blank" rel="noreferrer">buying me a coffee</a>!</p>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

export default Footer
