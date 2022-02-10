import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Toast } from 'react-bootstrap'
import styled from 'styled-components'
import AlertDetail from '../../models/AlertDetail'

const Wrapper = styled.div`
  .toast {
    background-color: rgba(255, 255, 255, 0.95)
  }
  .toast-header-content {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;

    svg {
      margin-right: 3px;
    }
  }

  .header-close-btn {
    cursor: pointer;
  }

  .error-ico {
    color: red;
  }
`

type Props = {
  alert: AlertDetail
  onClose?: Function
}

function AlertToast(props: Props) {
  const { alert, onClose } = props
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsShowing(true), 300)
    setIsShowing(true)
  }, [])

  function onToastClose() {
    setIsShowing(false)
    if(onClose) {
      onClose(alert)
    }
  }

  return (
    <Wrapper>
      <Toast show={isShowing}
        autohide={alert.autohide !== undefined ? alert.autohide : true}
        onClose={() => onToastClose()}>
        <Toast.Header closeButton={false}>
          <div className="toast-header-content">
            <strong className="me-auto">
              {alert.isError && <FontAwesomeIcon className="error-ico" icon="times-circle" />}
              { alert.title }
            </strong>
            <span className="header-close-btn" onClick={() => onToastClose()}>
              <FontAwesomeIcon icon="times" />
            </span>
          </div>
        </Toast.Header>
        <Toast.Body>
          { alert.body }
          { alert && alert.buttons != undefined && alert.buttons.length > 0 && (
            <div className="button-row">
              {alert.buttons.map((b, idx) => (
                <button className="btn btn-primary btn-sm"
                  key={`alert-${alert.id}-button-${idx}`}
                  onClick={b.fn}>
                    { b.title }
                </button>
              ))}
            </div>
          )}
        </Toast.Body>
      </Toast>
    </Wrapper>
  )
}

export default AlertToast
