import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { Item, Enums, SocketItem, Socket  } from '@guardianforge/destiny-data-utils'
import EquipmentItemCard from './EquipmentItemCard'
import ForgeButton from './forms/Button'
import ForgeModal from './Modal'
import Input from './forms/Input'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { BuildItem } from '../../models/Build'
import ItemCard from './ItemCard'
import ItemConfigModal from './ItemConfigModal'


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
  buildItem: BuildItem | undefined
  slot: Enums.BucketTypeEnum
  classType?: Enums.ClassEnum
  onItemUpdated: Function
  onItemClicked?: Function
  onPlugClicked?: Function
  highlights: Array<string>
  configurable?: boolean
  isHighlightModeOn?: boolean
  onHighlightableClicked?: Function
}

function EquipmentItem(props: EquipmentItemProps) {
  const {
    slot,
    classType,
    onItemUpdated,
    buildItem,
    highlights,
    configurable,
    isHighlightModeOn,
    onHighlightableClicked } = props

  const [isEditingItem, setIsEditingItem] = useState(false)
  const [isSelectingItem, setIsSelectingItem] = useState(false)
  const [inventorySubset, setInventorySubset] = useState<Array<Item>>([])
  const [filteredInventorySubset, setFilteredInventorySubset] = useState<Array<Item>>([])
  const [inventoryFilter, setInventoryFilter] = useState("")
  const [item, setItem] = useState<Item>()
  const [plugs, setPlugs] = useState<Map<number, Item[]>>()
  const [buttonText, setButtonText] = useState("")

  useEffect(() => {
    if(configurable && buildItem && buildItem.itemInstanceId) {
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
        let plugs = InventoryManager.getSocketPlugMapForItem(item)
        if(plugs) {
          setPlugs(plugs)
        }
      }
    }
  }, [item])

  useEffect(() => {
    console.log(item)
  }, [isEditingItem])

  function onHideModal() {
    setIsEditingItem(false)
  }

  function onHideSelectItemModal() {
    setIsSelectingItem(false)
  }

  function onItemSelected(itemSelected: Item) {
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

  function setEquippedPlug(socket: Socket, plug: (SocketItem | Item)) {
    let i = item
    if(i && i.sockets && socket.position !== undefined && i.sockets[socket.position]) {
      // @ts-ignore TODO: Remove with DDU has been refactored to use Items for Sockets
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

  return (
    <Wrapper>
      {buildItem && <ItemCard item={buildItem}
          highlights={highlights}
          configurable={configurable}
          itemTierData={item ? item.getItemTier() : undefined}
          power={item ? item.getPower() : undefined}
          onHighlightableClicked={onHighlightableClicked}
          onConfigureItemClicked={() => setIsEditingItem(true)}
          onSwapItemClicked={() => selectItem()}
          isHighlightable={isHighlightModeOn} />}

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

      <ItemConfigModal
        show={isEditingItem}
        onHide={onHideModal}
        item={item}
        plugs={plugs}
        onClose={() => setIsEditingItem(false)}
        setEquippedPlug={setEquippedPlug} />

    </Wrapper>
  )
}


export default EquipmentItem
