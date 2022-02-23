import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Plug from './Plug'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { BuildItem } from '../../models/Build'
import Card from './ui/Card'
import colors from '../../colors'

const Wrapper = styled(Card)`
	.subclass-card {
		width: 100%;
		display: flex;
		flex-direction: row;
		text-align: left;
		border-radius: 5px;
		padding: 5px;
		min-width: 287px;
	}
	.base-light-config {
		display: flex;
	}
	.base-light-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100px;
		img {
			max-width: 65px;
			margin: 2px;
		}
	}
	.light-config-tree {
		display: flex;
		flex-direction: column;
	}
	.light-tree-perk-wrapper {
		display: flex;
		border: 2px solid #14151a;
		border-radius: 5px;
		padding: 1px;
		img {
			width: 62px;
		}
		&.highlighted {
			padding: 0px;
		}
	}
	.tree-perk {
		margin: 5px;
	}
	.item-icon-wrapper {
		position: relative;
		height: 80px;
		width: 80px;
		margin-right: 5px;
	}
	.item-icon-wrapper-sm {
		margin: 0 auto;
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

    .socket-icon img {
      background-color: ${colors.theme2.socketIconBg};
    }
	}
	.socket-icon {
		img {
			max-width: 45px;
			margin: 0px 3px 3px 0px;
			border-radius: 5px;
		}
	}
	.light-subclass {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.light-character {
		img {
			max-width: 200px;
		}
	}
  .super-plug-icon {
    border-radius: 5px;
  }

  @media screen and (max-width: 796px) {
    .light-subclass {
      flex-direction: column;
    }

    .item-name {
      text-align: center;
    }

    .subclass-card {
      max-width: 287px;
      justify-content: center;
    }

    .base-light-config {
      justify-content: space-evenly;
    }

    .base-light-item {
      width: 33.333%;
      max-width: 75px;
    }

    .base-light-item img {
      width: 50px;
    }

    .light-config-tree {
      margin-top: 10px;
    }

    .tree-perk img {
      max-width: 50px;
    }

    .sockets {
      margin-top: 10px;
    }
  }
`

type Props = {
  item: BuildItem
  onPlugClicked?: Function
  highlights: Array<string>
  className?: string
}

function SubclassCard(props: Props) {
  const { item, onPlugClicked, highlights, className } = props

  const [isGrenadeHighlighted, setIsGrenadeHighlighted] = useState(false)
  const [isMovementHighlighted, setIsMovementHighlighted] = useState(false)
  const [isSpecialtyHighlighted, setIsSpecialtyHighlighted] = useState(false)
  const [isSuperTreeHighlighted, setIsSuperTreeHighlighted] = useState(false)

  useEffect(() => {
    console.log(item)
    if(highlights.find(el => el === "subclass-grenade-0-0")) {
      setIsGrenadeHighlighted(true)
    } else {
      setIsGrenadeHighlighted(false)
    }
    if(highlights.find(el => el === "subclass-movement-0-0")) {
      setIsMovementHighlighted(true)
    } else {
      setIsMovementHighlighted(false)
    }
    if(highlights.find(el => el === "subclass-specialty-0-0")) {
      setIsSpecialtyHighlighted(true)
    } else {
      setIsSpecialtyHighlighted(false)
    }
    if(highlights.find(el => el === "subclass-supertree-0-0")) {
      setIsSuperTreeHighlighted(true)
    } else {
      setIsSuperTreeHighlighted(false)
    }

  }, [highlights])

  function onPlugClickedHandler(type: string, subtype: string) {
    if(onPlugClicked) {
      onPlugClicked(type, subtype, "0", "0")
    }
  }

  return (
    <Wrapper className={className}>
      <div className="subclass-card">
        <div className="item-icon-wrapper d-md-block d-none">
          <img src={item.iconUrl} className="item-icon" />
        </div>
        <div className="item-content">
          <div className="item-icon-wrapper item-icon-wrapper-sm d-md-none d-sm-block d-xs-block">
            <img src={item.iconUrl} className="item-icon" />
          </div>
          <div className="item-name">
            {item.name}
          </div>
          <hr />

          {(item.isLightSubclass && item.superConfig) ? (
            <div className="light-subclass">
              <div className="base-light-config">
                {item.superConfig && item.superConfig.grenade && (
                  <div className="base-light-item">
                    <span>Grenade</span>
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={<Tooltip>{item.superConfig.grenade.name}</Tooltip>}>
                      <img src={item.superConfig.grenade.iconUrl}
                        className={"img-fluid highlightable super-plug-icon " + (isGrenadeHighlighted ? "highlighted" : "")}
                        onClick={() => onPlugClickedHandler('subclass', 'grenade')}
                        id="grenade" />
                      </OverlayTrigger>
                  </div>
                )}
                {item.superConfig && item.superConfig.movement && (
                  <div className="base-light-item">
                    <span>Movement</span>
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={<Tooltip>{item.superConfig.movement.name}</Tooltip>}>
                      <img src={item.superConfig.movement.iconUrl}
                        className={"img-fluid highlightable super-plug-icon " + (isMovementHighlighted ? "highlighted" : "")}
                        onClick={() => onPlugClickedHandler('subclass', 'movement')}
                        id="movement" />
                      </OverlayTrigger>
                  </div>
                )}
                {item.superConfig && item.superConfig.specialty && (
                  <div className="base-light-item">
                    <span>Ability</span>
                    <OverlayTrigger
                      placement="bottom"
                      delay={{ show: 250, hide: 400 }}
                      overlay={<Tooltip>{item?.superConfig?.specialty?.name}</Tooltip>}>
                      <img src={item?.superConfig?.specialty?.iconUrl}
                        className={"img-fluid highlightable super-plug-icon " + (isSpecialtyHighlighted ? "highlighted" : "")}
                        onClick={() => onPlugClickedHandler('subclass', 'specialty')}
                        id="specialty" />
                      </OverlayTrigger>
                  </div>
                )}
              </div>
              <div className="light-config-tree">
                <div className="tree-title">
                  { item.superConfig.treeTitle }
                  {item.superConfig.tree === 1 && (<span> (Top Tree)</span>)}
                  {item.superConfig.tree === 2 && (<span> (Bottom Tree)</span>)}
                  {item.superConfig.tree === 3 && (<span> (Middle Tree)</span>)}
                </div>
                <div className={"light-tree-perk-wrapper highlightable " + (isSuperTreeHighlighted ? "highlighted" : "")}
                    onClick={() => onPlugClickedHandler('subclass', 'supertree')}>
                      {item.superConfig.treeNodes && item.superConfig.treeNodes.map((el, idx) => (
                        <div key={`treenode-${item?.superConfig?.tree}-${idx}`} className="tree-perk">
                          <img src={el.iconUrl} />
                        </div>
                      ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {item.super && (
                <div className="abilities sockets col-md-2">
                  <span>Super</span>
                  <div className="socket-icon-wrapper">
                    {item.super.map((el, idx) => (
                      <div key={`super-${item.itemInstanceId}-${el.plugHash}-${idx}`} className="socket-icon">
                        <Plug plug={el} plugType="super" onClick={onPlugClicked} highlights={highlights}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`abilities sockets ${item.super ? "col-md-4" : "col-md-6"}`}>
                <span>Abilities</span>
                <div className="socket-icon-wrapper">
                  {item.abilities && item.abilities.map((el, idx) => (
                    <div key={`ability-${item.itemInstanceId}-${el.plugHash}-${idx}`} className="socket-icon">
                      <Plug plug={el} plugType="ability" onClick={onPlugClicked} highlights={highlights}/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aspects sockets col-md-6">
                <span>Aspects</span>
                <div className="socket-icon-wrapper">
                  {item.aspects && item.aspects.map((el, idx) => (
                    <div key={`aspect-${item.itemInstanceId}-${el.plugHash}-${idx}`} className="socket-icon">
                      <Plug plug={el} plugType="aspect" onClick={onPlugClicked} highlights={highlights}/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fragments sockets col-md-12">
                <span>Fragments</span>
                <div className="socket-icon-wrapper">
                  {item.fragments && item.fragments.map((el, idx) => (
                    <div key={`fragment-${item.itemInstanceId}-${el.plugHash}-${idx}`} className="socket-icon">
                      <Plug plug={el} plugType="fragment" onClick={onPlugClicked} highlights={highlights} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default SubclassCard
