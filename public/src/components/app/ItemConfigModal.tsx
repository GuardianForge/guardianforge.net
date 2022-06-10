import { Item, Socket, SocketItem } from '@guardianforge/destiny-data-utils'
import React, { useState } from 'react'
import { Button, Col, Modal, Row } from 'react-bootstrap'
import colors from '../../colors'
import ItemStatBar from './ItemStatBar'
import ItemTierBar from './ItemTierBar'
import ForgeModal from './Modal'
import styled from 'styled-components'
import ItemStatDisplay, { ItemStatDisplayModeEnum } from './ItemStatDisplay'

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
              {item?.stats?.get("Charge Time") && <ItemStatDisplay name="Charge Time" value={item.stats.get("Charge Time").value} displayMode={ItemStatDisplayModeEnum.None} />}
              {item?.stats?.get("Rounds Per Minute") && <ItemStatDisplay name="RPM" value={item.stats.get("Rounds Per Minute").value} displayMode={ItemStatDisplayModeEnum.None} />}
              {item?.stats?.get("Blast Radius") && <ItemStatDisplay name="Blast Radius" value={item.stats.get("Blast Radius").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Velocity") && <ItemStatDisplay name="Velocity" value={item.stats.get("Velocity").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Impact") && <ItemStatDisplay name="Impact" value={item.stats.get("Impact").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Guard Efficiency") && <ItemStatDisplay name="Guard Efficiency" value={item.stats.get("Guard Efficiency").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Guard Resistance") && <ItemStatDisplay name="Guard Resistance" value={item.stats.get("Guard Resistance").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Charge Rate") && <ItemStatDisplay name="Charge Rate" value={item.stats.get("Charge Rate").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Guard Endurance") && <ItemStatDisplay name="Guard Endurance" value={item.stats.get("Guard Endurance").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Ammo Capacity") && <ItemStatDisplay name="Ammo Capacity" value={item.stats.get("Ammo Capacity").value} displayMode={ItemStatDisplayModeEnum.None} />}
              {item?.stats?.get("Range") && <ItemStatDisplay name="Range" value={item.stats.get("Range").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Stability") && <ItemStatDisplay name="Stability" value={item.stats.get("Stability").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Handling") && <ItemStatDisplay name="Handling" value={item.stats.get("Handling").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Reload Speed") && <ItemStatDisplay name="Reload Speed" value={item.stats.get("Reload Speed").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Aim Assist") && <ItemStatDisplay name="Aim Assist" value={item.stats.get("Aim Assist").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Zoom") && <ItemStatDisplay name="Zoom" value={item.stats.get("Zoom").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {/* {item?.stats?.get("Recoil Direction") && <ItemStatDisplay name="Recoil Direction" value={item.stats.get("Recoil Direction").value} displayMode={ItemStatDisplayModeEnum.None} />} */}
              {item?.stats?.get("Magazine") && <ItemStatDisplay name="Magazine" value={item.stats.get("Magazine").value} displayMode={ItemStatDisplayModeEnum.None} />}

              {item?.stats?.get("Mobility") && <ItemStatDisplay name="Mobility" value={item.stats.get("Mobility").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Resilience") && <ItemStatDisplay name="Resilience" value={item.stats.get("Resilience").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Recovery") && <ItemStatDisplay name="Recovery" value={item.stats.get("Recovery").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Discipline") && <ItemStatDisplay name="Discipline" value={item.stats.get("Discipline").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Intellect") && <ItemStatDisplay name="Intellect" value={item.stats.get("Intellect").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
              {item?.stats?.get("Strength") && <ItemStatDisplay name="Strength" value={item.stats.get("Strength").value} displayMode={ItemStatDisplayModeEnum.Bar} />}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

export default ItemConfigModal