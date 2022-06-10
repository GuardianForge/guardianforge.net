import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import AlertDetail from '../../models/AlertDetail'
import AlertToast from './AlertToast'
import ReportErrorModal from './ReportErrorModal'

const Wrapper = styled.div`
  position: sticky;
  bottom: 0;
  right: 0px;
  background-color: red;
  z-index: 3000;
  display: flex;
  justify-content: flex-end;
  height: 0px !important;

  .toast {
    color: #111;
    .button-row {
      margin-top: 5px;
    }
  }

  .toast-err {
    .toast-title {
      svg {
        color: red
      }
    }
  }
`

function AlertLayer() {
  // @ts-ignore
  const { isErrorBeingReported } = useContext(GlobalContext)
  const [isModalShowing, setIsModalShowing] = useState(false)
  const [isHandlerRegistered, setIsHandlerRegistered] = useState(false)
  const [alerts, setAlerts] = useState<Array<AlertDetail>>([])

  // useState(() => {
  //   console.log("errorBeingReported", errorBeingReported)
  //   if(errorBeingReported && errorBeingReported.id && !isModalShowing) {
  //     setIsModalShowing(true)
  //   }
  // }, [errorBeingReported])

  useEffect(() => {
    if(!isHandlerRegistered) {
      // TODO: Uncomment this when its tested & working
      window.addEventListener("gf_alert", (e: any) => raiseAlert(e.detail))
      setIsHandlerRegistered(true)
    }
  }, [])

  function raiseAlert(alert: AlertDetail) {
    setAlerts([...alerts, alert])
  }

  function onToastClose(alert: AlertDetail) {
    let _alerts = [...alerts]
    _alerts = _alerts.filter(a => a.id !== alert.id)
    setAlerts(_alerts)
  }

  function reportError(alert: AlertDetail) {
    console.log("reportError", alert)
  }

  return (
    <Wrapper>
      <div className="toast-container position-absolute bottom-0 end-0 p-3">
        {alerts.map(a => (
          <AlertToast key={`${a.id}`} alert={a} onClose={() => onToastClose(a)} />
        ))}
      </div>

      {isErrorBeingReported && <ReportErrorModal />}
    </Wrapper>
  )
}

export default AlertLayer
