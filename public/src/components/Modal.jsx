import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components'
import { dark2, lightgrey } from "../colors"

const Wrapper = styled.div`
  background-color: #111 !important;
  border: 1px solid #444;

  .modal-header {
    border-bottom: 1px solid #444 !important;
  }

  .modal-footer {
    border-top: 1px solid #444 !important;
  }

  .btn-close {
    color: #eee !important;
  }

  .modal-title {
    font-weight: bold;
  }

  .accordion {
    margin: 10px 0px
  }

  .accordion-header {
    button {
      background-color: ${dark2} !important
    }
    .accordion-button:not(.collapsed) {
      color: ${lightgrey}
    }
    .collapsed {
      color: ${lightgrey}
    }
  }

  .accordion-item {
    background-color: ${dark2} !important
  }

  #metaInfoPane {
    padding: 10px;

    .inner {
      display: flex;
      flex-direction: column;
    }

    .field-title, label {
      font-weight: bold;
    }

    .large-data {
      display: flex;
      flex-direction: column;
    }
  }
`

function ForgeModal({ title, children, buttons, show, onClose }) {
  return (
    <Modal show={show}>
      <Wrapper>
        <Modal.Header>
          <Modal.Title>{ title }</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          { children }
        </Modal.Body>

        {buttons && buttons.length > 0 && (
          <Modal.Footer>
            {buttons.map((b, idx) => (
              <Button key={`forgemodal-b-${idx}`} onClick={b.onClick} >{ b.title }</Button>
            ))}
          </Modal.Footer>
        )}
      </Wrapper>
    </Modal>
  )
}

export default ForgeModal
