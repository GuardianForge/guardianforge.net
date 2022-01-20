import React, { useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components'
import colors from '../../../colors'

const Wrapper = styled(Modal)`
  border: 1px solid ${colors.theme2.border};

  .modal-content {
    background-color: ${colors.theme2.dark1} !important;
  }

  .modal-header {
    border-bottom: 1px solid ${colors.theme2.border} !important;
  }

  .modal-footer {
    border-top: 1px solid ${colors.theme2.border} !important;
  }

  .btn-close {
    color: #eee !important;
  }
`

type Props = {
  className?: string
  title?: string
  header?: React.ReactFragment
  children: React.ReactFragment
  footer?: React.ReactFragment
  show?: boolean
  scrollable?: boolean
  onHide?: Function
  centered?: boolean
  fullscreen?: boolean | string
  size?: string
}

function ForgeModal(props: Props) {
  const { className, title, children, show, onHide, scrollable, footer, centered, header, fullscreen, size } = props

  function onHideHandler() {
    if(onHide) {
      onHide()
    }
  }

  return (
    <Wrapper className={className} show={show} onHide={onHideHandler} scrollable={scrollable} centered={centered} fullscreen={fullscreen} size={size}>
      <Modal.Header>
        {header ? (
          <>{ header }</>
        ) : (
          <Modal.Title>{ title }</Modal.Title>
        )}
      </Modal.Header>

      <Modal.Body>
        { children }
      </Modal.Body>

      {footer !== undefined && (
        <Modal.Footer>
          { footer }
        </Modal.Footer>
      )}
    </Wrapper>
  )
}

export default ForgeModal
