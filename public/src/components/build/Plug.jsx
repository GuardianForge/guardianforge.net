import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from '../../contexts/GlobalContext'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { imageFixerMap } from '../../utils/shims'

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
  align-items: center;
  color: #ddd;
  font-style: italic;
  width: 100%;

  .socket-icon img {
    max-width: 45px;
    margin: 0px 6px 3px 0px;
    border-radius: 5px;
  }

  .perk { border-radius: 100px !important;
    padding: 3px !important;
    border: 2px solid #444;
  }
`

function Plug({ plug, plugType, highlights, onClick }) {
  const { isInitDone } = useContext(GlobalContext)
  const [plugName, setPlugName] = useState("")
  const [classes, setClasses] = useState("")
  const [fixedIconUrl, setFixedIconUrl] = useState("")

  useEffect(() => {
    if(imageFixerMap[plug.iconUrl]) {
      setFixedIconUrl(imageFixerMap[plug.iconUrl])
    }
  }, [])

  useEffect(() => {
    if(!plugName && plug.name) {
      setPlugName(plug.name)
    }
    let classes = ""
    let isHighlighted = highlights.find(el => el === `${plugType}-${plug.itemInstanceId}-${plug.socketIndex}-${plug.plugHash}`)
    if(isHighlighted) {
      classes += "highlighted "
    }
    if(!plug.isEmpty) {
      classes += "highlightable "
    }
    if(plugType === "perk") {
      classes += "perk "
    }
    setClasses(classes)
  }, [highlights])

  useEffect(() => {
    if(isInitDone) {
      return
    }
    const { ManifestService } = window.services
    if(!plugName) {
      let def = ManifestService.getItem("DestinyInventoryItemDefinition", plug.plugHash)
      if(def.displayProperties) {
        setPlugName(def.displayProperties.name)
      }
    }
  }, [isInitDone])

  function onClickHandler() {
    if(!plug.isEmpty && onClick) {
      onClick(plugType, plug.itemInstanceId, plug.socketIndex, plug.plugHash)
    }
  }

  return (
    <Wrapper>
    <OverlayTrigger
      placement="bottom"
      delay={{ show: 250, hide: 400 }}
      overlay={<Tooltip>{ plugName }</Tooltip>}>
        <img src={fixedIconUrl ? fixedIconUrl : plug.iconUrl}
          className={classes}
          onClick={onClickHandler}
          id={`plug-${plug.itemInstanceId}-${plug.socketIndex}-${plug.plugHash}`}
        />
      </OverlayTrigger>
    </Wrapper>
  )
}

export default Plug
