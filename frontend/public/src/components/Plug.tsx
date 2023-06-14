import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { GlobalContext } from "../contexts/GlobalContext"
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { imageFixerMap } from '../utils/shims'
import { BuildItemPlug } from '../models/Build'
import { Item, SocketItem } from '../data-utils/Main'
import colors from '../colors'
import Highlightable from './Highlightable'
import Image from './ui/Image'
import { useCreateBuildStore } from '../stores/buildstore'

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
  align-items: center;
  color: #ddd;
  font-style: italic;
  box-sizing: content-box;

  .socket-icon img {
    max-width: 45px;
    margin: 0px 6px 3px 0px;
    border-radius: 5px;
  }

  .mod {
    border: 2px solid ${colors.theme2.dark2};
  }

  .perk {
    border-radius: 100px !important;
    padding: 3px !important;
    border: 2px solid ${colors.theme2.dark1};
  }
`

type Props = {
  plug?: BuildItemPlug
  item?: Item | SocketItem
  plugType: string
  itemInstanceId: string
  socketIndex: number
}

function Plug(props: Props) {
  const { plug, item, plugType, itemInstanceId, socketIndex } = props

  const [isHighlightModeOn] = useCreateBuildStore((state) => [
    state.isHighlightModeOn
  ])

  const { isInitDone } = useContext(GlobalContext)
  const [fixedIconUrl, setFixedIconUrl] = useState("")

  const [plugName, setPlugName] = useState<string>()
  const [iconUrl, setIconUrl] = useState<string>()
  const [plugHash, setPlugHash] = useState<string>()
  const [isEmpty, setIsEmpty] = useState(false)

  useEffect(() => {
    if(item) {
      setPlugName(item.name)
      setIconUrl(item.iconUrl)
      // setSocketIndex()
      if(item._meta?.manifestDefinition.hash) {
        setPlugHash(item._meta.manifestDefinition.hash)
      }
      if(item.name?.startsWith("Empty")) {
        setIsEmpty(true)
      }
    }

    if(plug) {
      setPlugName(plug.name)
      // @ts-ignore TODO: Fix me
      if(imageFixerMap[plug.iconUrl]) {
        // @ts-ignore TODO: Fix me
        setFixedIconUrl(imageFixerMap[plug.iconUrl])
      } else {
        setIconUrl(plug.iconUrl)
      }
      setPlugHash(plug.plugHash)
      if(plug.isEmpty) {
        setIsEmpty(plug.isEmpty)
      }
    }
  }, [])

  useEffect(() => {
    if(isInitDone) {
      return
    }
    const { ManifestService } = window.services
    if(!plugName) {
      let def = ManifestService.getItem("DestinyInventoryItemDefinition", plugHash as string)
      if(def && def.displayProperties) {
        setPlugName(def.displayProperties.name)
      }
    }
  }, [isInitDone])

  return (
    <Wrapper>
      <Highlightable
        highlightKey={`${plugType}-${itemInstanceId}-${socketIndex}-${plugHash}`}
        isHighlightable={isHighlightModeOn && !isEmpty}
        highlightClass="socket-icon">
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip>{ plugName }</Tooltip>}>
          <span>
            <Image src={fixedIconUrl ? fixedIconUrl : iconUrl}
              className={`socket-icon ${plugType === "perk" ? "perk" : "mod"}`} />
          </span>
        </OverlayTrigger>
      </Highlightable>
    </Wrapper>
  )
}

export default Plug
