import React, {useState} from 'react'
import styled from 'styled-components'
import colors from '../../../colors'
import { Item  } from '@guardianforge/destiny-data-utils'
import ForgeButton from './forms/Button'
import ForgeModal from '../components/Modal'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { faCog, faExchangeAlt, faLessThanEqual } from '@fortawesome/free-solid-svg-icons'
import V3SubclassCard from './V3SubclassCard'
import V2SubclassCard from './V2SubclassCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  display: flex;
  /* justify-content: center;
  align-items: center; */
  flex-direction: column;
  padding: 10px;
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  min-height: 200px;

  .selected-subclass {
    flex: 1;
  }

  .icon-btns {
    display: flex;

    svg {
      height: 20px;
      width: 20px;
      margin-right: 10px;

      &:hover {
        cursor: pointer;
      }
    }
  }
`

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

function Subclass() {
  const [availableSubclasses, setAvailableSubclass] = useState([])
  const [selectedSubclass, setSelectedSubclass] = useState<Item>()
  const [isSelectingSubclass, setIsSelectingSubclass] = useState(false)
  const [isV3Subclass, setIsV3Subclass] = useState(false)

  function selectSubclass() {
    const selectedClass = 0
    const { InventoryManager } = window.services
    let subclasses = InventoryManager.getAvailableSubclasses(selectedClass)
    setAvailableSubclass(subclasses)
    setIsSelectingSubclass(true)
  }

  function onSubclassSelected(item: Item) {
    console.log(item)
    if(item._meta && item._meta.sockets) {
      setIsV3Subclass(true)
    } else {
      setIsV3Subclass(false)
    }
    setSelectedSubclass(item)
    setIsSelectingSubclass(false)
  }

  function configureSubclass() {

  }

  const footer = (
    <ForgeButton onClick={() => setIsSelectingSubclass(false)}>Close</ForgeButton>
  )

  return (
    <Wrapper>
      {selectedSubclass ? (
        <>
          <div className="selected-subclass">
            {isV3Subclass ? (
              <V3SubclassCard subclass={selectedSubclass} />
            ) : (
              <V2SubclassCard subclass={selectedSubclass} />
            )}
          </div>
          <div className="icon-btns">
            <FontAwesomeIcon icon={faCog} onClick={configureSubclass} />
            <FontAwesomeIcon icon={faExchangeAlt} onClick={selectSubclass} />
          </div>
        </>
      ) : (
        <SelectSubclassButtonWrapper>
          <ForgeButton onClick={() => selectSubclass()}>Select Subclass</ForgeButton>
        </SelectSubclassButtonWrapper>
      )}

      <ForgeModal show={isSelectingSubclass} title="Select Subclass" footer={footer}>
        <Container fluid>
          <Row>
            <Col>
              {availableSubclasses.map((i: Item) => (
                <SelectSubclassButton key={`subclass=${i.hash}`} onClick={() => onSubclassSelected(i)}>
                  <img src={i.iconUrl} />
                  <span>{ i.name }</span>
                </SelectSubclassButton>
              ))}
            </Col>
          </Row>
        </Container>
      </ForgeModal>
    </Wrapper>
  )
}
export default Subclass
