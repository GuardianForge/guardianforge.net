import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import EquipmentItemCard from './EquipmentItemCard'
import Input from './forms/Input'
import ForgeModal from './Modal'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { Enums, Item } from '@guardianforge/destiny-data-utils'
import ForgeButton from './forms/Button'


const Wrapper = styled(ForgeModal)`
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

type Props = {
  show?: boolean
  onHide?: Function
  title?: string
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  slot: Enums.BucketTypeEnum
  onItemSelected?: Function
  classType?: Enums.ClassEnum
}

function ItemSelectorModal(props: Props) {
  const { show, onHide, title, onClose, slot, onItemSelected, classType } = props

  const [filteredInventorySubset, setFilteredInventorySubset] = useState<Array<Item>>([])
  const [inventoryFilter, setInventoryFilter] = useState("")
  const [inventorySubset, setInventorySubset] = useState<Array<Item>>([])

  useEffect(() => {
    if(show) {
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
    }
  }, [classType, slot, show])

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

  function onItemClicked(itemSelected: Item) {
    setInventoryFilter("")
    setFilteredInventorySubset([])
    setInventorySubset([])
    if (onItemSelected) {
      onItemSelected(itemSelected)
    }
  }

  return (
    <ForgeModal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="xl-down"
      scrollable
      title={title}
      footer={
        <ForgeButton onClick={onClose}>Close</ForgeButton>
      }
      >
      <div>
        <div className="mb-2">
          <Input placeholder="Start typing to filter items..."
            type="text"
            value={inventoryFilter}
            prefixIcon={faFilter}
            onChange={(e: any) => onInventoryFilterChanged(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          {filteredInventorySubset.map((i: Item, idx: number) => (
            <EquipmentItemCard key={`item-${idx}-${i.name}`}
              onClick={() => onItemClicked(i)} item={i} showLocation />
          ))}
        </div>
      </div>
    </ForgeModal>
  )
}

export default ItemSelectorModal