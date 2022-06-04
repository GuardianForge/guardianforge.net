import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import colors from '../../colors'
import { Item, Enums, SocketItem, Socket  } from '@guardianforge/destiny-data-utils'
import ForgeButton from './forms/Button'
import { BuildItem } from '../../models/Build'
import ItemCard from './ItemCard'
import ItemConfigModal from './ItemConfigModal'
import ItemSelectorModal from './ItemSelectorModal'


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
  const [item, setItem] = useState<Item>()
  const [plugs, setPlugs] = useState<Map<number, Item[]>>()
  const [friendyBucketName, setFriendlyBucketName] = useState("")

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
        setFriendlyBucketName("Kinetic")
        break;
      case Enums.BucketTypeEnum.Energy:
        setFriendlyBucketName("Energy")
        break;
      case Enums.BucketTypeEnum.Power:
        setFriendlyBucketName("Power")
        break;
      case Enums.BucketTypeEnum.Helmet:
        setFriendlyBucketName("Helmet")
        break;
      case Enums.BucketTypeEnum.Arms:
        setFriendlyBucketName("Arms")
        break;
      case Enums.BucketTypeEnum.Chest:
        setFriendlyBucketName("Chest")
        break;
      case Enums.BucketTypeEnum.Legs:
        setFriendlyBucketName("Legs")
        break;
      case Enums.BucketTypeEnum.ClassItem:
        setFriendlyBucketName("Class Item")
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
  }

  function selectItem() {
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

  return (
    <Wrapper>
      {buildItem && <ItemCard item={buildItem}
          highlights={highlights}
          configurable={configurable}
          itemTierData={item ? item.getItemTier() : undefined}
          power={item ? item.getPower() : undefined}
          onHighlightableClicked={onHighlightableClicked}
          onConfigureItemClicked={() => setIsEditingItem(true)}
          onSwapItemClicked={() => setIsSelectingItem(true)}
          isHighlightable={isHighlightModeOn} />}

      {!buildItem && (
        <div className="select-item-wrapper">
          <ForgeButton onClick={() => setIsSelectingItem(true)}>Select { friendyBucketName }</ForgeButton>
        </div>
      )}

      <ItemSelectorModal
        show={isSelectingItem}
        onHide={onHideSelectItemModal}
        onClose={() => setIsSelectingItem(false)}
        classType={classType}
        onItemSelected={onItemSelected}
        slot={slot}
        title={`Select ${friendyBucketName}`} />

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
