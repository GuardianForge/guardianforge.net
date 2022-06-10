import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import styled from 'styled-components'
import colors from "../../colors"

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
      background-color: ${colors.dark2} !important
    }
    .accordion-button:not(.collapsed) {
      color: ${colors.lightgrey}
    }
    .collapsed {
      color: ${colors.lightgrey}
    }
  }

  .accordion-item {
    background-color: ${colors.dark2} !important
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

function ReportErrorModal() {
  const [username, setUsername] = useState("test_username")
  const [userId, setUserId] = useState("test_user_id")
  const [operation, setOperation] = useState("test_op")
  const [contactInfo, setContactInfo] = useState("")

  return (
    <Modal show>
      <Wrapper>
        <Modal.Header closeButton>
          <Modal.Title>Report an Error</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>We collect information about how the app was being used when the error occurred, so fields below are optional.</p>
          <hr className="mb-3" />
          <div className="form-group mb-3">
            <label>How can we contact you?</label>
            <textarea className="form-control" v-model="contactInfo">
            </textarea>
          </div>
          <div className="form-group mb-3">
            <label>Anything else you'd like to add?</label>
            <textarea className="form-control" v-model="userNote">
            </textarea>
          </div>

          <div id="accordionFlushExample" className="accordion accordion-flush">
            <div className="accordion-item">
              <h2 className="accordion-header" id="flush-headingOne">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#metaInfoPane" aria-expanded="false" aria-controls="metaInfoPane">
                  See Data Being Collected
                </button>
              </h2>
              <div id="metaInfoPane" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                <div className="inner">
                  <div v-if="userName"><span className="field-title">User Name:</span> {username} </div>
                  <div v-if="userId"><span className="field-title">User ID:</span> {userId} </div>
                  <div v-if="operation"><span className="field-title">Operation:</span> {operation} </div>
                  <div className="large-data" v-if="metaInfo">
                    <span className="field-title">Misc Info:</span>
                    <textarea v-model="metaInfo" disabled></textarea>
                  </div>
                  <div className="large-data" v-if="localUserData">
                    <span className="field-title">User Data:</span>
                    <textarea v-model="localUserData" disabled></textarea>
                  </div>
                  <div className="large-data" v-if="stack">
                    <span className="field-title">Full Error:</span>
                    <textarea v-model="stack" disabled></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary">Submit</Button>
        </Modal.Footer>
      </Wrapper>
    </Modal>
  )
}

export default ReportErrorModal
