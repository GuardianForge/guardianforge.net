import React, { ReactNode } from 'react'
import { Modal } from 'react-bootstrap';
import styled from 'styled-components'

const Wrapper = styled(Modal)`
  .btn-close {
    color: #eee !important;
  }
`

type Props = {
  className?: string
  title?: string
  header?: React.ReactFragment
  children: ReactNode
  footer?: ReactNode
  show?: boolean
  scrollable?: boolean
  onHide?: Function
  centered?: boolean
  fullscreen?: boolean | string
  size?: string
  closeButton?: boolean
}

function ForgeModal(props: Props) {
  const { className, title, children, show, onHide, scrollable, footer, centered, header, fullscreen, size, closeButton } = props

  return (
  <Wrapper
    className={`forge-modal ${className}`}
    show={show}
    onHide={onHide}
    scrollable={scrollable ? scrollable : true}
    centered={centered}
    fullscreen={fullscreen}
    size={size}>
      <Modal.Header closeButton={closeButton} closeVariant="white">
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
