import { faCog, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Item } from '@guardianforge/destiny-data-utils';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../../../colors';
import ForgeModal from './Modal';
import V2SuperTree from './V2SuperTree';


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

    &-lower {
      display: flex;

      .perks-col {
        margin-right: 30px;

        .perk {
          margin-bottom: 20px;
          img {
            width: 75px;
            margin-right: 10px;
          }
        }
      }

      .equipped-tree {
        margin-left: 70px;
        margin-top: 40px;
        margin-bottom: 20px;
      }
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

      img {
        max-height: 60px;
        max-width: 60px;
        border-radius: 5px;
        background-color: #111;
        margin-right: 5px;
      }
    }
  }
`

const SubclassConfigModalBody = styled(Container)`
  .perk-title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  .perk-row {
    display: flex;
    margin-bottom: 20px;

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

    .selected {
      border: 2px solid yellow;

      &:hover {
        border: 2px solid yellow;
        cursor: pointer;
      }
    }
  }

  .tree-diamond-container {
    .tree-diamond {
      margin-top: 35px;
      margin-left: 20px;
      margin-bottom: 35px;
      height: 150px;
      width: 150px;

      img {
        height: 45px !important;
        width: 45px !important;
      }
    }
  }
`

enum AffinityEnum {
  Arc = 2,
  Solar = 3,
  Void = 4
}

type Props = {
  subclass: Item
  onChangeSubclassClicked: MouseEventHandler
  onSubclassUpdated: Function
}

function V2SubclassCard(props: Props) {
  const { subclass, onChangeSubclassClicked, onSubclassUpdated } = props
  const [specialty, setSpecialty] = useState<any>()
  const [grenade, setGrenade] = useState<any>()
  const [movement, setMovement] = useState<any>()
  const [tree, setTree] = useState<any>()
  const [affinity, setAffinity] = useState(0)
  const [availableSpecialties, setAvailableSpecialties] = useState<any>()
  const [availableGrenades, setAvailableGrenades] = useState<any>()
  const [availableMovementModes, setAvailableMovementModes] = useState<any>()
  const [availableSuperTress, setAvailableSuperTrees] = useState<any>()
  const [isConfigureSubclassModalShown, setIsConfigureSubclassModalShown] = useState(false)

  useEffect(() => {
    setSpecialty(subclass.getEquippedClassSpecialty())
    setGrenade(subclass.getEquippedGrenade())
    setMovement(subclass.getEquippedMovementMode())
    setTree(subclass.getEquippedSuperTree())

    if(subclass.name === "Striker") {
      setAffinity(AffinityEnum.Arc)
    }
    if(subclass.name === "Sunbreaker") {
      setAffinity(AffinityEnum.Solar)

    }
    if(subclass.name === "Sentinel") {
      setAffinity(AffinityEnum.Void)
    }

    // Setup modal
    // TODO: Set custom titles based on class (ex: Barricade, Rift, Dodge...)
    setAvailableSpecialties(subclass.getAvailableClassSpecialties())
    setAvailableGrenades(subclass.getAvailableGrenades())
    setAvailableMovementModes(subclass.getAvailableMovementModes())
    setAvailableSuperTrees(subclass.getAvailableSuperTrees())

  }, [subclass])

  function onConfigureSubclassClicked() {
    setIsConfigureSubclassModalShown(true)
  }

  function onTreeClicked(tree: any) {
    setTree(tree)
  }

  return (
    <Wrapper>
      <div className="subclass-left">
        <div className="subclass-left-top">
          <img className="icon" src={subclass.iconUrl} />
        </div>
        <div>
          <div className="icon-btns">
            <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
            <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
          </div>
        </div>
      </div>
      <div className="subclass-right">
        <span className="name">{ subclass.name } {tree ? `• ${tree.name}` : ""}</span>
        <div className="subclass-right-lower">
          <div className="perks-col">
            {grenade && (
              <div className="perk">
                <img src={`https://www.bungie.net${grenade.icon}`} />
                <span className="perk-title">{grenade.name}</span>
              </div>
            )}
            {specialty && (
              <div className="perk">
                <img src={`https://www.bungie.net${specialty.icon}`} />
                <span className="perk-title">{specialty.name}</span>
              </div>
            )}
            {movement && (
              <div className="perk">
                <img src={`https://www.bungie.net${movement.icon}`} />
                <span className="perk-title">{movement.name}</span>
              </div>
            )}
          </div>
          {tree && <V2SuperTree className="equipped-tree" tree={tree} affinity={affinity} hideName/>}
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
              <span className="perk-title">Grenades</span>
              <div className="perk-row">
                {availableGrenades && availableGrenades.map((p: any) => (
                  <div>
                    <img className={p.name === grenade.name ? "available-perk selected" : "available-perk"}
                      src={`https://www.bungie.net${p.icon}`}
                      onClick={() => setGrenade(p)} />
                  </div>
                ))}
              </div>
            </Col>
            <Col>
              <span className="perk-title">Class Specialty</span>
              <div className="perk-row">
                {availableSpecialties && availableSpecialties.map((p: any) => (
                  <div>
                    <img className={p.name === specialty.name ? "available-perk selected" : "available-perk"}
                      src={`https://www.bungie.net${p.icon}`}
                      onClick={() => setSpecialty(p)} />
                  </div>
                ))}
              </div>
            </Col>
            <Col>
              <span className="perk-title">Movement Modes</span>
              <div className="perk-row">
                {availableMovementModes && availableMovementModes.map((p: any) => (
                  <div>
                    <img className={p.name === movement.name ? "available-perk selected" : "available-perk"}
                      src={`https://www.bungie.net${p.icon}`}
                      onClick={() => setMovement(p)} />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="perk-title super-tree-title">Super Trees</span>
            </Col>
          </Row>
          <Row>
            {availableSuperTress && availableSuperTress.map((t: any, idx: number) => (
              <Col key={`available-super-tree-${idx}`}>
                <div className="tree-diamond-container">
                  <V2SuperTree
                    tree={t}
                    affinity={affinity}
                    onClick={onTreeClicked}
                    selected={tree.name === t.name} />
                </div>
              </Col>
            ))}
          </Row>
        </SubclassConfigModalBody>
      </ForgeModal>
    </Wrapper>
  )
}

export default V2SubclassCard;
