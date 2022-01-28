import React, { useEffect, useState } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { Item, Enums, SocketItem, Socket  } from '@guardianforge/destiny-data-utils'
import EquipmentItemCard from './EquipmentItemCard'
import ForgeButton from './forms/Button'
import ForgeModal from './Modal'
import Input from './forms/Input'
import { faCog, faExchangeAlt, faFilter } from '@fortawesome/free-solid-svg-icons'
import { BuildItem } from '../../models/Build'
import ItemCard from './ItemCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ModalSelector from './forms/ModalSelector'


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  margin-top: 20px;
  min-height: 100px;

  .card-content {
    margin-bottom: 0px !important;
  }

  .select-item-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100px;
  }
`

const ItemConfigModal = styled(ForgeModal)`
  .modal-title {
    img {
      height: auto;
      max-width: 40px;
      margin-right: 5px;
      border-radius: 5px;
    }
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

  .row-header {
    font-weight: bold;
    margin: 5px 0px;
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

const ItemSelectorModal = styled(ForgeModal)`
  .filter {
    margin: 10px 0px;
    display: flex;

    &> div {
      width: 100%;
    }

    input {
      border-radius: 3px;
      width: 100%;
    }
  }

  .item-card {
    &:hover {
      cursor: pointer;
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

type EquipmentItemProps = {
  buildItem: BuildItem | undefined
  slot: Enums.BucketTypeEnum
  classType?: Enums.ClassEnum
  onItemUpdated: Function
  onItemClicked?: Function
  onPlugClicked?: Function
  highlights: Array<string>
  configurable?: boolean
}


function EquipmentItem(props: EquipmentItemProps) {
  const {
    slot,
    classType,
    onItemUpdated,
    buildItem,
    highlights,
    onItemClicked,
    onPlugClicked,
    configurable } = props

  const [isEditingItem, setIsEditingItem] = useState(false)
  const [isSelectingItem, setIsSelectingItem] = useState(false)
  const [inventorySubset, setInventorySubset] = useState<Array<Item>>([])
  const [filteredInventorySubset, setFilteredInventorySubset] = useState<Array<Item>>([])
  const [inventoryFilter, setInventoryFilter] = useState("")
  const [item, setItem] = useState<Item>()
  const [mods, setMods] = useState<Map<number, Item[]>>()
  const [buttonText, setButtonText] = useState("")

  useEffect(() => {
    if(configurable && buildItem) {
      const { InventoryManager } = window.services
      let itemSelected = InventoryManager.getItemForInstanceId(buildItem?.itemInstanceId)
      if(itemSelected) {
        setItem(itemSelected)
        onItemUpdated(itemSelected)
      }
    }
  }, [configurable])

  useEffect(() => {
    switch(slot) {
      case Enums.BucketTypeEnum.Kinetic:
        setButtonText("Select Kinetic");
        break;
      case Enums.BucketTypeEnum.Energy:
        setButtonText("Select Energy");
        break;
      case Enums.BucketTypeEnum.Power:
        setButtonText("Select Power");
        break;
      case Enums.BucketTypeEnum.Helmet:
        setButtonText("Select Helmet");
        break;
      case Enums.BucketTypeEnum.Arms:
        setButtonText("Select Arms");
        break;
      case Enums.BucketTypeEnum.Chest:
        setButtonText("Select Chest");
        break;
      case Enums.BucketTypeEnum.Legs:
        setButtonText("Select Legs");
        break;
      case Enums.BucketTypeEnum.ClassItem:
        setButtonText("Select Class Item");
        break;
    }
  }, [])

  useEffect(() => {
    if(item) {
      // @ts-ignore
      const { InventoryManager } = window.services
      if(InventoryManager) {
        let itemMods = InventoryManager.getModsForItem(item)
        if(itemMods) {
          setMods(itemMods)
        }
      }
    }
  }, [item])

  function onHideModal() {
    setIsEditingItem(false)
  }

  function onHideSelectItemModal() {
    setIsSelectingItem(false)
  }

  function onItemSelected(itemSelected: Item) {
    console.log("onItemSelected", itemSelected)
    setItem(itemSelected)
    onItemUpdated(itemSelected)
    setIsSelectingItem(false)
    setInventoryFilter("")
    setInventorySubset([])
    setFilteredInventorySubset([])
  }

  function selectItem() {
    // @ts-ignore
    let { InventoryManager } = window.services
    let items = InventoryManager.lookupItems(undefined, undefined, classType, slot)
    if(slot === Enums.BucketTypeEnum.Kinetic || slot === Enums.BucketTypeEnum.Energy || slot === Enums.BucketTypeEnum.Power) {
      let items2 = InventoryManager.lookupItems(undefined, undefined, 3, slot)
      items2.forEach((i: Item) => items.push(i))
    }
    items.sort((a: Item, b: Item) => {
      if (!a.name || !b.name) return 0;
      if ( a.name < b.name ){
        return -1;
      }
      if ( a.name > b.name ){
        return 1;
      }
      return 0;
    })
    setInventorySubset(items)
    setFilteredInventorySubset(items)
    setIsSelectingItem(true)
  }

  function setEquippedPlug(socket: Socket, plug: SocketItem) {
    let i = item
    if(i && i.sockets && socket.position !== undefined && i.sockets[socket.position]) {
      i.sockets[socket.position].equippedPlug = plug
    }
    setItem(i)
    onItemUpdated(i)
  }

  function onInventoryFilterChanged(filter: string) {
    if(inventorySubset) {
      if(filter !== "") {
        let filtered = inventorySubset.filter((i: Item) => i.name?.toLowerCase().includes(filter.toLowerCase()))
        setFilteredInventorySubset(filtered)
      } else {
        setFilteredInventorySubset(inventorySubset)
      }
    }
    setInventoryFilter(filter)
  }


  const [isModDrawerOpen, setIsModDrawerOpen] = useState(false)
  const [availableMods, setAvailableMods] = useState<Array<Item>>()
  const [socketBeingEdited, setSocketBeingEdited] = useState<Socket>()
  const [maxModCostAllowed, setMaxModCostAllowed] = useState(0)
  function showModDrawer(socket: Socket) {
    console.log(socket, item)
    if(socket.position !== undefined) {
      let am = mods?.get(socket.position)
      am = am?.filter((i: Item) => (i.energyType === 0 || i.energyType === item.energyType))
      setAvailableMods(am)
      let itemTier = item?.getItemTier()
      if(itemTier && itemTier.tier) {
        let currentConsumption = item.getModEnergyConsumption()
        if(socket.equippedPlug && socket.equippedPlug.cost) {
          currentConsumption = currentConsumption - socket.equippedPlug.cost
        }
        setMaxModCostAllowed(itemTier.tier - currentConsumption)
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

  function onItemClickedHandler() {
    if(item && onItemClicked) {
      onItemClicked(item._meta.inventoryItem.itemInstanceId)
    }
  }

  function onPlugClickedHandler(type: string, instanceId: string, socketIndex: string, plugHash: string) {
    if(item && onPlugClicked) {
      onPlugClicked(type, item._meta.inventoryItem.itemInstanceId, socketIndex, plugHash)
    }
  }

  return (
    <Wrapper>
      {buildItem && <ItemCard item={buildItem}
          highlights={highlights}
          configurable={configurable}
          itemTierData={item ? item.getItemTier() : undefined}
          power={item ? item.getPower() : undefined}
          onItemClicked={onItemClickedHandler}
          onPlugClicked={onPlugClickedHandler}
          onConfigureItemClicked={() => setIsEditingItem(true)}
          onSwapItemClicked={() => selectItem()} />}

      {!buildItem && (
        <div className="select-item-wrapper">
          <ForgeButton onClick={selectItem}>{ buttonText }</ForgeButton>
        </div>
      )}

      {/* Item Selector Modal */}
      <ItemSelectorModal
        show={isSelectingItem}
        onHide={onHideSelectItemModal}
        size="xl"
        fullscreen="xl-down"
        scrollable
        title={buttonText}
        footer={
          <Button onClick={() => setIsSelectingItem(false)}>Close</Button>
        }
        >
        <div>
          <div className="filter">
            <Input placeholder="Start typing to filter items..."
              type="text"
              value={inventoryFilter}
              prefixIcon={faFilter}
              onChange={(e: any) => onInventoryFilterChanged(e.target.value)} />
          </div>
          <div className="row">
            {filteredInventorySubset.map((i: Item, idx: number) => (
              <div className="item-card col-md-4 mb-2" key={`item-${idx}-${i.name}`} onClick={() => onItemSelected(i)}>
                <EquipmentItemCard item={i} showLocation />
              </div>
            ))}
          </div>
        </div>
      </ItemSelectorModal>

      {/* Item Config Modal */}
      <ItemConfigModal
        show={isEditingItem}
        onHide={onHideModal}
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
          <Button onClick={() => setIsEditingItem(false)}>Close</Button>
        }
        >
        <div>
          <div className="intrinsic-row">
            {item?.getIntrinsicTraits()?.map((el: SocketItem, idx: number) => (
              <div className="intrinsic-trait">
                <img src={el.iconUrl} />
                <div>
                  <div className="intrinsic-trait-name">{ el.name }</div>
                  <div>{ el.getDescription() }</div>
                </div>
              </div>
            ))}
          </div>
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
                    {!socket.isItemTierSocket && (
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
                      <SelectItemButton disabled={plug.cost > maxModCostAllowed} className="activity-option" onClick={() => onSocketPlugClicked(plug)}>
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
        </div>
      </ItemConfigModal>
    </Wrapper>
  )
}


export default EquipmentItem
