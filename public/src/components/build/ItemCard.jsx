import React, { useState, useEffect } from 'react'
import Plug from '../../components/build/Plug'
import styled from 'styled-components'

const Wrapper = styled.div`
  padding: 5px;

  @media screen and (max-width: 796px) {
    display: flex;
    justify-content: center;
  }

  .item-card {
    display: flex;
    flex-direction: row;
    box-shadow: 2px 2px 2px rgba(0,0,0,0.05);
    background-color: #1E1F24;
    text-align: left;
    border-radius: 5px;
    padding: 5px;
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

function ItemCard({ item, onItemClicked, onPlugClicked, highlights, className }) {
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
    <Wrapper className={className ? className : ""}>
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
              {item.perks && item.perks.map((p, idx) => (
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
              {item.mods && item.mods.map((m, idx) => (
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
