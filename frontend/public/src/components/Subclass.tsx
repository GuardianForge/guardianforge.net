import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import colors from '../colors'
import { Enums, Item  } from '@guardianforge/destiny-data-utils'
import ForgeButton from './forms/Button'
import ForgeModal from './Modal'
import { Button, Col, Container, Row } from 'react-bootstrap'
import V3SubclassCard from './V3SubclassCard'
import V2SubclassCard from './V2SubclassCard'
import { BuildItem } from '../models/Build'
import Card from './ui/Card'

const SelectSubclassButtonWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`

const SelectSubclassButton = styled(Button)`
  width: 100%;
  background-color: ${colors.theme2.dark2} !important;
  border: none !important;
  display: flex !important;
  align-items: center;
  justify-content: start;
  font-size: 24px !important;
  margin-bottom: 10px;

  &:hover {
    background-color: ${colors.theme2.dark3} !important;
  }

  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
`

type Props = {
  configurable?: boolean
  onSubclassUpdated: Function
  selectedClass?: Enums.ClassEnum
  buildItem?: BuildItem
  highlights: Array<string>
  onCardPlugClicked?: Function
  isHighlightModeOn?: boolean
  onHighlightableClicked?: Function
  className?: string
}

function Subclass(props: Props) {
  const { onSubclassUpdated, selectedClass, buildItem, configurable, highlights, onCardPlugClicked, isHighlightModeOn, onHighlightableClicked, className } = props
  const [availableSubclasses, setAvailableSubclass] = useState<Array<Item>>([])
  const [selectedSubclass, setSelectedSubclass] = useState<Item>()
  const [isSelectingSubclass, setIsSelectingSubclass] = useState(false)
  const [isV3Subclass, setIsV3Subclass] = useState(false)

  useEffect(() => {
    if(buildItem) {
      let { InventoryManager } = window.services
      if(buildItem.abilities && buildItem.abilities.length > 0) {
        setIsV3Subclass(true)
      } else if(buildItem.superConfig) {
        setIsV3Subclass(false)
      }

      if(buildItem.itemInstanceId && configurable) {
        let sc = InventoryManager.getItemForInstanceId(buildItem?.itemInstanceId)
        if(sc) {
          setSelectedSubclass(sc)
          onSubclassUpdated(sc)
        }
      }
    }
  }, [])

  function selectSubclass() {
    const { InventoryManager } = window.services
    if(selectedClass !== undefined) {
      let subclasses = InventoryManager.getAvailableSubclasses(selectedClass)
      setAvailableSubclass(subclasses)
      setIsSelectingSubclass(true)
    }
  }

  function onSubclassSelected(item: Item) {
    if(item.getSubclassVersion() === 3) {
      setIsV3Subclass(true)
    } else {
      setIsV3Subclass(false)
    }
    setSelectedSubclass(item)
    setIsSelectingSubclass(false)
    onSubclassUpdated(item)
  }

  const footer = (
    <ForgeButton onClick={() => setIsSelectingSubclass(false)}>Close</ForgeButton>
  )


  return (
    <Card className={`min-h-[150px] flex items-center justify-center ${className}`}>
      {(buildItem || selectedSubclass) && (
        <div className="selected-subclass w-full">
          {isV3Subclass ? (
            <V3SubclassCard
              buildItem={buildItem}
              subclass={selectedSubclass}
              onChangeSubclassClicked={() => selectSubclass()}
              onSubclassUpdated={onSubclassUpdated}
              configurable={configurable}
              highlights={highlights}
              onCardPlugClicked={onCardPlugClicked}
              isHighlightModeOn={isHighlightModeOn}
              onHighlightableClicked={onHighlightableClicked}  />
          ) : (
            <V2SubclassCard
              buildItem={buildItem}
              subclass={selectedSubclass}
              onChangeSubclassClicked={() => selectSubclass()}
              onSubclassUpdated={onSubclassUpdated}
              configurable={configurable}
              highlights={highlights}
              isHighlightModeOn={isHighlightModeOn}
              onHighlightableClicked={onHighlightableClicked}  />
          )}
        </div>
      )}

      {!buildItem && !selectedSubclass && (
        <SelectSubclassButtonWrapper>
          <ForgeButton onClick={() => selectSubclass()}>Select Subclass</ForgeButton>
        </SelectSubclassButtonWrapper>
      )}

      <ForgeModal show={isSelectingSubclass} title="Select Subclass" footer={footer}>
        <Container fluid>
          <Row>
            <Col>
              {availableSubclasses.map((i: Item) => (
                <SelectSubclassButton key={`subclass-${i.hash}`} onClick={() => onSubclassSelected(i)}>
                  <img src={i.iconUrl} alt="" />
                  <span>{ i.name }</span>
                </SelectSubclassButton>
              ))}
            </Col>
          </Row>
        </Container>
      </ForgeModal>
    </Card>
  )
}
export default Subclass
