import React, {useState} from 'react'
import styled from 'styled-components'
import colors from '../../../colors'
import { Item  } from '@guardianforge/destiny-data-utils'
import ForgeButton from './forms/Button'
import ForgeModal from '../components/Modal'

const SelectItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
`

const SelectSubclassWrapper = styled(SelectItemWrapper)`
  min-height: 200px;
`

function Subclass() {
  const [availableSubclasses, setAvailableSubclass] = useState([])
  const [selectedSubclass, setSelectedSubclass] = useState({})
  const [isSelectingSubclass, setIsSelectingSubclass] = useState(false)

  function selectSubclass() {
    const selectedClass = 0
    const { InventoryManager } = window.services
    let subclasses = InventoryManager.getAvailableSubclasses(selectedClass)
    console.log(subclasses)
    setAvailableSubclass(subclasses)
    setIsSelectingSubclass(true)
  }

  const footer = (
    <ForgeButton onClick={() => setIsSelectingSubclass(false)}>Close</ForgeButton>
  )

  return (
    <SelectSubclassWrapper>
      <ForgeButton onClick={() => selectSubclass()}>Select Subclass</ForgeButton>

      <ForgeModal show={isSelectingSubclass} title="Select Subclass" footer={footer}>
        {availableSubclasses.map((i: Item) => (
          <div>
            { i.name }
          </div>
        ))}
      </ForgeModal>
    </SelectSubclassWrapper>
  )
}
export default Subclass
