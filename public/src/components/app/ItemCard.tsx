import React, { useState, useEffect } from 'react'
import Plug from './Plug'
import styled from 'styled-components'
import { BuildItem, BuildItemPlug } from '../../models/Build'
import Card from './ui/Card'

const Wrapper = styled(Card)`
  padding: 5px;

  @media screen and (max-width: 796px) {
    display: flex;
    justify-content: center;
  }

  .item-card {
    display: flex;
    flex-direction: row;
    text-align: left;
    min-width: 287px;
    max-width: 287px;
  }

  .item-icon-wrapper {
    position: relative;
    height: 80px;
    width: 80px;
    margin-right: 5px;
  }

  .item-icon {
    max-width: 75px;
    border-radius: 5px;
    margin-right: 5px;
  }

  .affinity-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 30px;
    border-radius: 100px;
  }

  .item-name {
    font-weight: bold;
  }

  .socket-icon-wrapper {
    display: flex;
    flex-wrap: wrap;
  }

  .socket-icon img {
    max-width: 45px;
    margin: 0px 3px 3px 0px;
    border-radius: 5px;
  }
`

type Props = {
  item: BuildItem
  onItemClicked?: Function
  onPlugClicked?: Function
  highlights: Array<string>
  className?: string
}

function ItemCard(props: Props) {
  const { item, onItemClicked, onPlugClicked, highlights, className } = props

  const [isHighlighted, setIsHighlighted] = useState(false)

  useEffect(() => {
    if(highlights.find(el => el === `item-${item.itemInstanceId}`)) {
      setIsHighlighted(true)
    } else {
      setIsHighlighted(false)
    }
  }, [highlights])

  function onItemClickedHandler() {
    if(onItemClicked) {
      onItemClicked(item.itemInstanceId)
    }
  }

  return (
    <Wrapper className={className}>
      <div className="item-card">
        <div className="item-icon-wrapper">
          <img src={item.ornamentIconUrl ? item.ornamentIconUrl : item.iconUrl}
            className={`item-icon highlightable ${isHighlighted ? "highlighted" : ""}`}
            onClick={onItemClickedHandler} />
          {item.affinityIcon && (<img src={item.affinityIcon} className="affinity-icon" />)}
        </div>
        <div className="item-content">
          <div className="item-name">
            {item.name}
          </div>
          <hr />
          <div className="perks sockets">
            <div className="socket-icon-wrapper">
              {item.perks && item.perks.map((p: BuildItemPlug, idx: number) => (
                <div key={`perk-${item.itemInstanceId}-${p.plugHash}-${idx}`} className="socket-icon">
                  <Plug
                    plug={p}
                    plugType="perk"
                    highlights={highlights}
                    onClick={onPlugClicked} />
                </div>
              ))}
            </div>
          </div>
          <div className="mods sockets">
            <div className="socket-icon-wrapper">
              {item.mods && item.mods.map((m: BuildItemPlug, idx: number) => (
                <div key={`mod-${item.itemInstanceId}-${m.plugHash}-${idx}`} className="socket-icon">
                  <Plug
                    plug={m}
                    plugType="mod"
                    highlights={highlights}
                    onClick={onPlugClicked} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

export default ItemCard
