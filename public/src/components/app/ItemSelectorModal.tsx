import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import EquipmentItemCard from './EquipmentItemCard'
import Input from './forms/Input'
import ForgeModal from './Modal'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'react-bootstrap'
import { Enums, Item } from '@guardianforge/destiny-data-utils'


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
  }, [])

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
    setInventorySubset([])
    setFilteredInventorySubset([])
    if (onItemSelected) {
      onItemSelected(itemSelected)
    }
  }

  return (
    <Wrapper
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="xl-down"
      scrollable
      title={title}
      footer={
        <Button onClick={onClose}>Close</Button>
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
            <div className="item-card col-md-4 mb-2" key={`item-${idx}-${i.name}`}
              onClick={() => onItemClicked(i)}>
              <EquipmentItemCard item={i} showLocation />
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  )
}

export default ItemSelectorModal