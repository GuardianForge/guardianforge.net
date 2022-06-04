import { faCog, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Item, Socket } from '@guardianforge/destiny-data-utils';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../../colors';
import { BuildItem } from '../../models/Build';
import ForgeModal from './Modal';
import Plug from './Plug';

const Wrapper = styled.div`
  display: flex;

  .icon {
    max-height: 80px;
    max-width: 80px;
  }

  .subclass-left {
    display: flex;
    flex-direction: column;
    margin-right: 10px;

    &-top {
      flex: 1;
    }
  }

  .subclass-right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .name {
      font-weight: bold;
      border-bottom: 2px solid ${colors.theme2.dark1};
      margin-bottom: 10px;
    }

    .socket-category {
      font-weight: bold;
    }

    .sockets {
      display: flex;
      flex-direction: column;

      .socket-row {
        display: flex;
        margin-bottom: 20px;
      }

      .socket-set {
        display: flex;
        justify-content: start;
        flex-wrap: wrap;
      }

      img {
        max-height: 60px;
        max-width: 60px;
        border-radius: 5px;
        background-color: ${colors.theme2.socketIconBg};
        margin-right: 5px;
        margin-bottom: 5px;

      }
    }
  }
`

const SubclassConfigModalBody = styled(Container)`
  .perk-title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  img {
    background-color: #111;
    border-radius: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
    /* border: 1px solid rgba(0,0,0,0); */

    &:hover {
      cursor: pointer;
      /* border: 1px solid ${colors.theme2.accent2}; */
    }
  }

  .perk-row {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;

    img {
      max-height: 96px;
      max-width: 96px;
    }

    .available-perk {
      height: 50px;
      width: 50px;
      margin-right: 10px;
      border-radius: 5px;
      border: 2px solid rgba(0,0,0,0);

      &:hover {
        border: 2px solid ${colors.theme2.accent1};
        cursor: pointer;
      }
    }

    .disabled:hover {
      cursor: not-allowed !important;
    }

    .selected {
      border: 2px solid yellow;

      &:hover {
        border: 2px solid yellow;
        cursor: pointer;
      }
    }
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
    background-color: #111;
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
  subclass?: Item
  buildItem?: BuildItem
  onSubclassUpdated?: Function
  onChangeSubclassClicked?: React.MouseEventHandler
  configurable?: boolean
  highlights: Array<string>
  onCardPlugClicked?: Function
  isHighlightModeOn?: boolean
  onHighlightableClicked?: Function
}

function V3SubclassCard(props: Props) {
  const { subclass, onSubclassUpdated, onChangeSubclassClicked, configurable, buildItem, highlights, onCardPlugClicked, isHighlightModeOn, onHighlightableClicked } = props
  const [isConfigureSubclassModalShown, setIsConfigureSubclassModalShown] = useState(false)
  const [socketPlugMap, setSocketPlugMap] = useState<Map<number, Item[]>>()


  useEffect(() => {
    if(subclass) {
      console.log(subclass)
      const { InventoryManager } = window.services
      let map = InventoryManager.getSocketPlugMapForItem(subclass)
      if(map) {
        setSocketPlugMap(map)
      }

      let fragSlots = calculateAvailableFragmentSlots()
      if(fragSlots !== null) {
        setAvailableFragmentSlots(fragSlots)
      }
    }
  }, [subclass])

  const [availableFragmentSlots, setAvailableFragmentSlots] = useState(0)
  function onConfigureSubclassClicked() {
    let fragmentSlots = calculateAvailableFragmentSlots()
    if(fragmentSlots) {
      setAvailableFragmentSlots(fragmentSlots)
    }
    setIsConfigureSubclassModalShown(true)
  }

  function calculateAvailableFragmentSlots(): (number | null) {
    let fragmentSlots: (number | null) = null;
    if(subclass && subclass.sockets) {
      let aspectSockets = subclass.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "ASPECTS")
      aspectSockets.forEach((s: Socket) => {
        if(s.equippedPlug
          && s.equippedPlug._meta
          && s.equippedPlug._meta.manifestDefinition
          && s.equippedPlug._meta.manifestDefinition.investmentStats) {
            s.equippedPlug._meta.manifestDefinition.investmentStats.forEach((el: any) => {
              if(el.statTypeHash === 2223994109) { // TODO: Move this into an enum in DDU (Stasis Energy)
                if(!fragmentSlots) {
                  fragmentSlots = 0
                }
                fragmentSlots += el.value
              }
            })
        }
      })
    }
    console.log("calculateAvailableFragmentSlots:", fragmentSlots)
    return fragmentSlots
  }

  const [isEditingSocket, setIsEditingSocket] = useState(false)
  const [socketBeingEdited, setSocketBeingEdited] = useState<Socket>()
  const [availablePlugs, setAvailablePlugs] = useState<Array<Item>>()
  function onConfigureSocketClicked(socket: Socket) {
    if(socket.position !== undefined) {
      setSocketBeingEdited(socket)
      let plugs = socketPlugMap?.get(socket.position)
      // TODO: Filter out available aspects/fragments that are equipped in other sockets
      if(subclass && subclass.sockets) {
        let similarSockets = subclass.sockets.filter((s: Socket) =>
          s._meta?.categoryDefinition.displayProperties.name === socket._meta?.categoryDefinition.displayProperties.name
        )
        plugs = plugs?.filter((i: Item) => {
          let retVal = true;
          if(i.name === "Empty Fragment Socket" || i.name === "Empty Aspect Socket") {
            return true
          }
          similarSockets.forEach((s: Socket) => {
            if(s.position !== socket.position && s.equippedPlug && s.equippedPlug.name === i.name) {
              retVal = false
            }
          })
          return retVal
        })
        setAvailablePlugs(plugs)
      }
      setIsEditingSocket(true)
    }
  }

  function setEquippedPlug(socket: Socket, plug: Item) {
    let s = subclass
    if(s && s.sockets && socket.position !== undefined && s.sockets[socket.position]) {
      // @ts-ignore
      s.sockets[socket.position].equippedPlug = plug

      // recalculate fragments
      let fragmentSlots = calculateAvailableFragmentSlots()
      if(fragmentSlots) {
        setAvailableFragmentSlots(fragmentSlots)
      }

      // Remove equipped fragmets in positions over whats available
      let fragmentSockets = s.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS")
      fragmentSockets.forEach((socket: Socket, idx: number) => {
        if(s && s.sockets && fragmentSlots !== null && socket.position && (idx + 1 > fragmentSlots)) {
          let plugsForSocket = socketPlugMap?.get(socket.position)
          let emptyFragmentPlug = plugsForSocket?.find(p => p.name === "Empty Fragment Socket")
          if(emptyFragmentPlug && s.sockets[socket.position]) {
            // @ts-ignore TODO: Update once Im using items for sockets
            s.sockets[socket.position].equippedPlug = emptyFragmentPlug
          }
        }
      })
    }

    if(onSubclassUpdated) {
      onSubclassUpdated(s)
    }
  }

  function isFragmentSlotDisabled(socket: Socket) {
    let retVal = false
    if(subclass && subclass.sockets) {
      let fragmentSockets = subclass.sockets.filter((s: Socket) => s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS")
      fragmentSockets.forEach((s: Socket, idx: number) => {
        if(availableFragmentSlots !== undefined && s.position === socket.position && (idx + 1 > availableFragmentSlots)) {
          retVal = true
        }
      })
    }
    return retVal
  }

  function onSocketPlugClicked(plug: Item) {
    if(socketBeingEdited) {
      setEquippedPlug(socketBeingEdited, plug)
      setAvailablePlugs(undefined)
      setSocketBeingEdited(undefined)
      setIsEditingSocket(false)
    }
  }

  function onCloseEditSocketClicked() {
    setSocketBeingEdited(undefined)
    setIsEditingSocket(false)
  }

  if(subclass) {
    return (
      <Wrapper>
        <div className="subclass-left">
          <div className="subclass-left-top">
            <img className="icon" src={subclass.iconUrl} />
            {/* <div>
              Stats
              <div className="stats">
                {subclass.stats && subclass.stats.get("Intellect") && <span><img src="/img/stats/int.png" /> {subclass.stats.get("Intellect").value}</span>}
              </div>
            </div> */}
          </div>

          {configurable && (
            <div className="icon-btns">
              <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
              <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
            </div>
          )}

        </div>
        <div className="subclass-right">
          <span className="name">{ subclass.name }</span>
          <div className="sockets">
            <Row className="socket-row">
              <Col xs="12" md="2" className="socket-category">
                <span>Super</span>
                <div className="socket-set">
                  {subclass.sockets?.map(s =>(
                    <>
                      {s._meta?.categoryDefinition.displayProperties.name === "SUPER" && (
                        <Plug key={`socket-super-${s.position}-${subclass._meta.inventoryItem.itemInstanceId}`}
                          plugType="super"
                          item={s.equippedPlug}
                          highlights={highlights}
                          itemInstanceId={subclass._meta.inventoryItem.itemInstanceId}
                          socketIndex={Number(s.position)}
                          isHighlightable={isHighlightModeOn}
                          onClick={onHighlightableClicked} />
                      )}
                    </>
                  ))}
                </div>
              </Col>
              <Col xs="12" md="4" className="socket-category">
                <span>Abilities</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "ABILITIES" && (
                      <Plug key={`socket-abilities-${s.position}-${subclass._meta.inventoryItem.itemInstanceId}`}
                        plugType="ability"
                        item={s.equippedPlug}
                        highlights={highlights}
                        itemInstanceId={subclass._meta.inventoryItem.itemInstanceId}
                        socketIndex={Number(s.position)}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                    )}
                  </>
                ))}
                </div>
              </Col>
              <Col xs="12" md="6" className="socket-category">
                <span>Aspects</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "ASPECTS" && (
                      <Plug key={`socket-aspects-${s.position}-${subclass._meta.inventoryItem.itemInstanceId}`}
                        plugType="aspect"
                        item={s.equippedPlug}
                        highlights={highlights}
                        itemInstanceId={subclass._meta.inventoryItem.itemInstanceId}
                        socketIndex={Number(s.position)}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked} />
                    )}
                  </>
                ))}
                </div>
              </Col>
            </Row>
            <Row className="socket-row">
              <div className="socket-category">
                <span>Fragments</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS" && (
                      <Plug key={`socket-fragments-${s.position}-${subclass._meta.inventoryItem.itemInstanceId}`}
                        plugType="fragment"
                        item={s.equippedPlug}
                        highlights={highlights}
                        itemInstanceId={subclass._meta.inventoryItem.itemInstanceId}
                        socketIndex={Number(s.position)}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                    )}
                  </>
                ))}
                </div>
              </div>
            </Row>
          </div>
        </div>

        <ForgeModal
          size="xl"
          show={isConfigureSubclassModalShown}
          title={subclass.name}
          footer={<Button onClick={() => setIsConfigureSubclassModalShown(false)}>Close</Button>}>
          <SubclassConfigModalBody>
            <Row>
              <Col>
                <span className="perk-title">Super</span>
                <div className="perk-row">
                  {subclass.sockets?.map(s =>(
                    <>
                      {s._meta?.categoryDefinition.displayProperties.name === "SUPER" && (
                        <img onClick={() => onConfigureSocketClicked(s)} key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                      )}
                    </>
                  ))}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="perk-title">Abilities</span>
                <div className="perk-row">
                  {subclass.sockets?.map(s =>(
                    <>
                      {s._meta?.categoryDefinition.displayProperties.name === "ABILITIES" && (
                        <img onClick={() => onConfigureSocketClicked(s)} key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                      )}
                    </>
                  ))}
                </div>
              </Col>
              <Col>
                <span className="perk-title">Aspects</span>
                <div className="perk-row">
                  {subclass.sockets?.map(s =>(
                    <>
                      {s._meta?.categoryDefinition.displayProperties.name === "ASPECTS" && (
                        <img onClick={() => onConfigureSocketClicked(s)}  key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                      )}
                    </>
                  ))}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="perk-title">Fragments ({availableFragmentSlots} available)</span>
                <div className="perk-row">
                  {subclass.sockets?.map(s =>(
                    <>
                      {s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS" && (
                        <img onClick={isFragmentSlotDisabled(s) !== true ? () => onConfigureSocketClicked(s) : undefined}
                          className={`${isFragmentSlotDisabled(s) ? 'disabled' : ''}`}
                          key={`socket-${s.position}`}
                          src={s.equippedPlug?.iconUrl} />
                      )}
                    </>
                  ))}
                </div>
              </Col>
            </Row>
          </SubclassConfigModalBody>
        </ForgeModal>

        <ForgeModal show={isEditingSocket} title="Select Item" footer={(<Button onClick={() => onCloseEditSocketClicked()}>Close</Button>)}>
          <div>
            {availablePlugs && availablePlugs.map((i: Item) => (
              <SelectItemButton onClick={() => onSocketPlugClicked(i)}>
                { i.iconUrl && <img className="plug-icon" src={i.iconUrl} />}
                <div className="right">
                  <div>{ i.name }</div>
                  {i._meta &&
                    i._meta.manifestDefinition &&
                    i._meta.manifestDefinition.investmentStats &&
                    i._meta.manifestDefinition.investmentStats.length > 0 &&
                    i._meta.manifestDefinition.investmentStats[0].statTypeHash === 2223994109 &&  (
                    <div className="energy-cost">Fragment Slots: <span>{i._meta.manifestDefinition.investmentStats[0].value}</span></div>
                  )}
                </div>
              </SelectItemButton>
            ))}
            {availablePlugs && availablePlugs.length === 0 && <span>No options available.</span>}
          </div>
        </ForgeModal>
      </Wrapper>
    )
  }

  if(buildItem) {
    return (
      <Wrapper>
        <div className="subclass-left">
          <div className="subclass-left-top">
            <img className="icon" src={buildItem.iconUrl} />
          </div>

          {configurable && (
            <div className="icon-btns">
              <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
              <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
            </div>
          )}
        </div>
        <div className="subclass-right">
          <span className="name">{ buildItem.name }</span>
          <div className="sockets">
            <div className="socket-row">
              <div className="socket-category">
                <span>Super</span>
                <div className="socket-set">
                  {buildItem.super?.map((_super: any, idx: number) =>(
                      <Plug key={`super-${idx}`}
                        plugType="super"
                        plug={_super}
                        highlights={highlights}
                        itemInstanceId={buildItem.itemInstanceId ? buildItem.itemInstanceId : ""}
                        socketIndex={_super.socketIndex}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                  ))}
                </div>
              </div>
              <div className="socket-category">
                <span>Abilities</span>
                <div className="socket-set">
                  {buildItem.abilities?.map((ability: any, idx: number) =>(
                      <Plug key={`ability-${idx}`}
                        plugType="ability"
                        plug={ability}
                        highlights={highlights}
                        itemInstanceId={buildItem.itemInstanceId ? buildItem.itemInstanceId : ""}
                        socketIndex={ability.socketIndex}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                  ))}
                </div>
              </div>
              <div className="socket-category">
                <span>Aspects</span>
                <div className="socket-set">
                  {buildItem.aspects?.map((aspect: any, idx: number) =>(
                      <Plug key={`aspect-${idx}`}
                        plugType="aspect"
                        plug={aspect}
                        highlights={highlights}
                        itemInstanceId={buildItem.itemInstanceId ? buildItem.itemInstanceId : ""}
                        socketIndex={aspect.socketIndex}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                  ))}
                </div>
              </div>
            </div>
            <div className="socket-row">
              <div className="socket-category">
                <span>Fragments</span>
                <div className="socket-set">
                  {buildItem.fragments?.map((fragment: any, idx: number) =>(
                      <Plug key={`fragment-${idx}`}
                        plugType="fragment"
                        plug={fragment}
                        highlights={highlights}
                        itemInstanceId={buildItem.itemInstanceId ? buildItem.itemInstanceId : ""}
                        socketIndex={fragment.socketIndex}
                        isHighlightable={isHighlightModeOn}
                        onClick={onHighlightableClicked}  />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  return <div />
}

export default V3SubclassCard;
