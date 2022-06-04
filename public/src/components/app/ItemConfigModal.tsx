import { Item, Socket, SocketItem } from '@guardianforge/destiny-data-utils'
import React, { useState } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import colors from '../../colors'
import ItemStatBar from './ItemStatBar'
import ItemTierBar from './ItemTierBar'
import ForgeModal from './Modal'
import styled from 'styled-components'

const Wrapper = styled(ForgeModal)`
  .modal-title {
    img {
      height: auto;
      max-width: 40px;
      margin-right: 5px;
      border-radius: 5px;
    }
  }

  .config-modal-wrapper {
    display: flex;
    flex-direction: column;
  }

  .config-modal-top {
    margin: 0px 5px 5px 5px;
  }

  .config-modal-bottom {
    display: flex;

    @media screen and (max-width: 992px) {
      flex-direction: column;
    }
  }

  .config-modal-left {
    flex: 1;
    margin: 0px 5px;
  }

  .config-modal-right {
    flex: 1;
    margin: 0px 5px;
  }

  .intrinsic-trait {
    display: flex;

    &-name {
      font-weight: bold;
    }

    img {
      height: 50px;
      max-width: 50px;
      margin-right: 10px;
    }

    div {
      flex: 1;
    }
  }

  .item-stats {
    /* display: flex; */
    display: grid;
    grid-template-columns: 1fr auto 2fr;
    /* grid-template-columns: repeat(3, 1fr); */
    grid-rows-auto: auto;
    grid-column-gap: 5px;
    grid-row-gap: 5px;
  }

  .row-header {
    font-weight: bold;
    margin: 5px 0px 10px 0px;
    padding-bottom: 2px;
    border-bottom: 1.5px solid ${colors.theme2.text};
  }

  .perks-row {
    .perks {
      display: flex;

      .perk-column {
        display: flex;
        flex-direction: column;
        padding-right: 5px;

        img {
          height: auto;
          max-width: 50px;
          background-color: black;
          margin: 0px 3px 5px 0px;
          border-radius: 100px !important;
          padding: 3px !important;
          border: 2px solid #444;

          &.equipped {
            background-color: #518CBA;
          }

          &.available:hover {
            cursor: pointer;
          }
        }
      }
    }
  }

  .mods-row {
    .equipped {
      border: 3px solid #2482ca;
    }

    .mod-sockets {
      display: flex;
    }

    .is-editing {
      animation: border-pulsate 2s infinite;
    }

    @keyframes border-pulsate {
      0% {
        border-color: ${colors.theme2.accent1};
      }
      50% {
        border-color: rgba(255, 255, 0, 0.1);
      }
      100% {
        border-color: ${colors.theme2.accent1};
      }
    }

    img {
      height: auto;
      max-width: 56px;
      border-radius: 5px;
      margin: 0px 8px 5px 0px;
      background-color: black;
      border: 3px solid rgba(0,0,0,0);

      &:hover {
        cursor: pointer
      }
    }
  }

  .mod-drawer {
    background-color: ${colors.theme2.dark2};
    border-radius: 5px;
    padding: 10px;
  }
`

const SelectItemButton = styled(Button)`
  width: 100%;
  background-color: ${colors.theme2.dark2} !important;
  border: none !important;
  display: flex !important;
  align-items: center;
  justify-content: start;
  font-size: 18px !important;
  margin-bottom: 10px;

  &:hover {
    background-color: ${colors.theme2.dark3} !important;
  }

  img {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    border-radius: 5px;
  }

  .right {
    display: flex;
    flex-direction: column;
    text-align: left;

    .energy-cost {
      font-style: italic;
      font-size: 16px;
    }

    .energy-cost-over {
      color: #ff3939;
      font-weight: bold;
    }
  }
`

type Props = {
  show?: boolean
  onHide?: Function
  item?: Item
  plugs?: Map<number, Item[]>
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  setEquippedPlug: Function
}

function ItemConfigModal(props: Props) {
  const { show, onHide, item, plugs, onClose, setEquippedPlug } = props

  const [isModDrawerOpen, setIsModDrawerOpen] = useState(false)
  const [availableMods, setAvailableMods] = useState<Array<Item>>()
  const [socketBeingEdited, setSocketBeingEdited] = useState<Socket>()
  const [maxModCostAllowed, setMaxModCostAllowed] = useState(0)

  function showModDrawer(socket: Socket) {
    if(item && socket.position !== undefined) {
      let am = plugs?.get(socket.position)
      am = am?.filter((i: Item) => (i.energyType === 0 || i.energyType === item.energyType))
      setAvailableMods(am)
      let itemTier = item?.getItemTier()
      if(itemTier && itemTier.tier) {
        let currentConsumption = item.getModEnergyConsumption()
        if(currentConsumption) {
          if(socket.equippedPlug && socket.equippedPlug.cost) {
            currentConsumption = currentConsumption - socket.equippedPlug.cost
          }
          setMaxModCostAllowed(itemTier.tier - currentConsumption)
        }
      }
      setSocketBeingEdited(socket)
      setIsModDrawerOpen(true)
    }
  }

  function onSocketPlugClicked(plug: Item) {
    if(socketBeingEdited) {
      setEquippedPlug(socketBeingEdited, plug)
      setAvailableMods(undefined)
      setSocketBeingEdited(undefined)
      setMaxModCostAllowed(0)
      setIsModDrawerOpen(false)
    }
  }

  return (
    <Wrapper
      show={show}
      onHide={onHide}
      scrollable
      centered
      size="lg"
      header={
        <Modal.Title className="modal-title">
          {item && item.iconUrl && <img src={item.iconUrl} />}
          { item ? item.name : "" }
        </Modal.Title>
      }
      footer={
        <Button onClick={onClose}>Close</Button>
      }
      >
      <div className="config-modal-wrapper">
        {item?.getItemTier() && item?.getItemTier().tier && (
          <div className="config-modal-top">
            <div className="row-header">Tier</div>
            <ItemTierBar value={item.getModEnergyConsumption() as number}
              capacity={item?.getItemTier().tier as number}
              affinityIcon={item?.getItemTier().icon as string} />
          </div>
        )}
        <div className="config-modal-bottom">
          <div className="config-modal-left">
            {item?.getPerkSockets() && (
              <div className="perks-row">
                <div className="row-header">Perks</div>
                <div className="perks">
                  {item?.getPerkSockets()?.map((socket: Socket) => (
                    <div className="perk-column">
                      {socket.availablePlugs ? socket.availablePlugs?.map((plug: SocketItem) => (
                        <img onClick={() => setEquippedPlug(socket, plug)} className={`available ${socket.equippedPlug?._meta?.manifestDefinition?.hash === plug._meta?.manifestDefinition?.hash ? 'equipped' : ""}`} src={plug.iconUrl} />
                      )) : (
                        <img className="equipped" src={socket.equippedPlug?.iconUrl} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item?.getModSockets() && (
              <div className="mods-row">
                <div className="row-header">Mods</div>
                <div className="mod-sockets">
                  {item?.getModSockets()?.map((socket: Socket) => (
                    <>
                      {/* TODO: This is a hack, fix it by figuring out why the URL is undefined... */}
                      {!socket.isItemTierSocket && socket.equippedPlug && socket.equippedPlug.iconUrl !== "https://www.bungie.netundefined" && (
                        <div className="mod-socket">
                          <img onClick={() => showModDrawer(socket)} src={socket.equippedPlug?.iconUrl} />
                        </div>
                      )}
                    </>
                  ))}
                </div>
                <ForgeModal
                  centered
                  size="xl"
                  show={isModDrawerOpen}
                  title="Select Mod"
                  footer={<Button onClick={() => setIsModDrawerOpen(false)}>Close</Button>}>
                  <Row>
                    {availableMods && availableMods.map((plug: Item, idx: number) => (
                      <Col md="4" key={`plug-${idx}`} >
                        <SelectItemButton disabled={plug.cost !== undefined && (plug.cost > maxModCostAllowed)} className="activity-option" onClick={() => onSocketPlugClicked(plug)}>
                          { plug.iconUrl && <img className="plug-icon" src={plug.iconUrl} />}
                          <div className="right">
                            <div>{ plug.name }</div>
                            {plug.cost && (
                              <div className="energy-cost">Cost: <span className={plug.cost > maxModCostAllowed ? "energy-cost-over" : ""}>{plug.cost}</span></div>
                            )}
                          </div>
                        </SelectItemButton>
                      </Col>
                    ))}
                  </Row>
                </ForgeModal>
              </div>
            )}
            {item?.getIntrinsicTraits()?.map((el: SocketItem, idx: number) => (
              <div className="intrinsic-row">
                <div className="row-header">Intrinsic Traits</div>
                <div className="intrinsic-trait">
                  <img src={el.iconUrl} />
                  <div>
                    <div className="intrinsic-trait-name">{ el.name }</div>
                    <div>{ el.getDescription() }</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="config-modal-right">
            <div className="row-header">Stats</div>
            <div className="item-stats">
              {item?.stats?.keys() && [...item.stats.keys()].map(k => (
                <>
                  {k !== "Rounds Per Minute" && k !== "Magazine" && (
                    <>
                      <div>{k}: </div>
                      <div className="item-stat-value">{item?.stats?.get(k)?.value}</div>
                      <ItemStatBar value={item?.stats?.get(k)?.value} />
                    </>
                  )}
                </>
              ))}
              {item?.stats?.get("Magazine") && (
                <>
                  <div>Magazine: </div>
                  <div>{item?.stats?.get("Magazine")?.value}</div>
                  <div />
                </>
              )}
              {item?.stats?.get("Rounds Per Minute") && (
                <>
                  <div>Rounds Per Minute: </div>
                  <div>{item?.stats?.get("Rounds Per Minute")?.value}</div>
                  <div />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

export default ItemConfigModal