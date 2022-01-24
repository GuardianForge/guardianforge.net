import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { Item, Enums, SocketItem, Socket  } from '@guardianforge/destiny-data-utils'
import EquipmentItemCard from './EquipmentItemCard'
import ForgeButton from './forms/Button'
import ForgeModal from './Modal'
import Input from './forms/Input'
import { faFilter } from '@fortawesome/free-solid-svg-icons'


const SelectItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
`

const SelectWeaponArmorWrapper = styled(SelectItemWrapper)`
  margin-top: 20px;
  min-height: 100px;
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
      background-color: black;
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

type EquipmentItemProps = {
  item: Item
  children: any
  slot: Enums.BucketTypeEnum
  classType: Enums.ClassEnum
  onItemUpdated: Function
}


function EquipmentItem(props: EquipmentItemProps) {
  const { children, slot, classType, onItemUpdated } = props

  const [isEditingItem, setIsEditingItem] = useState(false)
  const [isSelectingItem, setIsSelectingItem] = useState(false)
  const [inventorySubset, setInventorySubset] = useState<Array<Item>>([])
  const [filteredInventorySubset, setFilteredInventorySubset] = useState<Array<Item>>([])
  const [inventoryFilter, setInventoryFilter] = useState("")
  const [item, setItem] = useState<Item>()
  const [mods, setMods] = useState<Map<number, Item[]>>()

  const [iterator, setIterator] = useState(1)

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
    setIterator(iterator + 1)
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
  function showModDrawer(socket: Socket) {
    console.log(socket)
    if(socket.position !== undefined) {
      let am = mods?.get(socket.position)
      console.log(am)
      setAvailableMods(am)
      setSocketBeingEdited(socket)
      // setSocketEditPosition(socket.position)
      setIsModDrawerOpen(true)
    }
  }

  function onSocketPlugClicked(plug: Item) {
    if(socketBeingEdited) {
      setEquippedPlug(socketBeingEdited, plug)
      setAvailableMods(undefined)
      setSocketBeingEdited(undefined)
      setIsModDrawerOpen(false)
    }
  }

  return (
    <SelectWeaponArmorWrapper>
      {item ? (
        <EquipmentItemCard item={item}
          configurable
          onConfigureItemClicked={() => setIsEditingItem(true)}
          onSwapItemClicked={() => selectItem()} />
      ) : (
        <ForgeButton onClick={selectItem}>{ children }</ForgeButton>
      )}

      {/* Item Selector Modal */}
      <ItemSelectorModal
        show={isSelectingItem}
        onHide={onHideSelectItemModal}
        size="xl"
        fullscreen="xl-down"
        scrollable
        title={children}
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
                    {iterator && socket.availablePlugs ? socket.availablePlugs?.map((plug: SocketItem) => (
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
                  <div className="mod-socket">
                    <img onClick={() => showModDrawer(socket)}
                      className={socketBeingEdited?.position === socket.position ? "is-editing" : ""}
                      src={socket.equippedPlug?.iconUrl} />
                  </div>
                ))}
              </div>
              {isModDrawerOpen && (
                <div className="mod-drawer">
                  {availableMods && availableMods.map((plug: Item) => (
                    <img src={plug.iconUrl} onClick={() => onSocketPlugClicked(plug)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ItemConfigModal>

    </SelectWeaponArmorWrapper>
  )
}


export default EquipmentItem
