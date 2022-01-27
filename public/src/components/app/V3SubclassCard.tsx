import { faCog, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Item } from '@guardianforge/destiny-data-utils';
import React, { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../../colors';
import { BuildItem } from '../../models/Build';
import ForgeModal from './Modal';

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
`

type Props = {
  subclass?: Item
  buildItem?: BuildItem
  onSubclassUpdated: Function
  onChangeSubclassClicked: React.MouseEventHandler
  configurable?: boolean
}

function V3SubclassCard(props: Props) {
  const { subclass, onSubclassUpdated, onChangeSubclassClicked, configurable, buildItem } = props
  const [isConfigureSubclassModalShown, setIsConfigureSubclassModalShown] = useState(false)

  function onConfigureSubclassClicked() {
    setIsConfigureSubclassModalShown(true)
  }

  if(subclass) {
    return (
      <Wrapper>
        <div className="subclass-left">
          <img className="icon" src={subclass.iconUrl} />
          {/* // TODO: Stat bumps */}

          {configurable && (
            <div className="icon-btns">
              <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
              <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
            </div>
          )}
        </div>
        <div className="subclass-right">
          <span className="name">{ subclass.name }</span>
          <div className="sockets">
            <div className="socket-row">
              <div className="socket-category">
                <span>Abilities</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "ABILITIES" && (
                      <img key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                    )}
                  </>
                ))}
                </div>
              </div>
              <div className="socket-category">
                <span>Aspects</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "ASPECTS" && (
                      <img key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                    )}
                  </>
                ))}
                </div>
              </div>
            </div>
            <div className="socket-row">
              <div className="socket-category">
                <span>Fragments</span>
                <div className="socket-set">
                {subclass.sockets?.map(s =>(
                  <>
                    {s._meta?.categoryDefinition.displayProperties.name === "FRAGMENTS" && (
                      <img key={`socket-${s.position}`} src={s.equippedPlug?.iconUrl} />
                    )}
                  </>
                ))}
                </div>
              </div>
            </div>
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
                <span className="perk-title">Abilities</span>
                <div className="perk-row">
                  {/* {availableGrenades && availableGrenades.map((p: any) => (
                    <div>
                      <img className={p.name === grenade.name ? "available-perk selected" : "available-perk"}
                        src={`https://www.bungie.net${p.icon}`}
                        onClick={() => setGrenade(p)} />
                    </div>
                  ))} */}
                </div>
              </Col>
              <Col>
                <span className="perk-title">Aspects</span>
                <div className="perk-row">
                  {/* {availableSpecialties && availableSpecialties.map((p: any) => (
                    <div>
                      <img className={p.name === specialty.name ? "available-perk selected" : "available-perk"}
                        src={`https://www.bungie.net${p.icon}`}
                        onClick={() => setSpecialty(p)} />
                    </div>
                  ))} */}
                </div>
              </Col>
              <Col>
                <span className="perk-title">Fragments</span>
                <div className="perk-row">
                  {/* {availableMovementModes && availableMovementModes.map((p: any) => (
                    <div>
                      <img className={p.name === movement.name ? "available-perk selected" : "available-perk"}
                        src={`https://www.bungie.net${p.icon}`}
                        onClick={() => setMovement(p)} />
                    </div>
                  ))} */}
                </div>
              </Col>
            </Row>
          </SubclassConfigModalBody>
        </ForgeModal>

      </Wrapper>
    )
  }

  if(buildItem) {
    return (
      <Wrapper>
        <div className="subclass-left">
          <div className="subclass-left-top">
            <img className="icon" src={buildItem.iconUrl} />
            {/* // TODO: Stat bumps */}
          </div>

          {configurable && (
            <div className="icon-btns">
              <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
              <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
            </div>
          )}
        </div>
        <div className="subclass-right">
          <span className="name">{ buildItem.name }</span>
          <div className="sockets">
            <div className="socket-row">
              <div className="socket-category">
                <span>Abilities</span>
                <div className="socket-set">
                  {buildItem.abilities?.map((ability: any, idx: number) =>(
                    <img key={`ability-${idx}`} src={ability?.iconUrl} />
                  ))}
                </div>
              </div>
              <div className="socket-category">
                <span>Aspects</span>
                <div className="socket-set">
                  {buildItem.aspects?.map((aspect: any, idx: number) =>(
                    <img key={`aspect-${idx}`} src={aspect?.iconUrl} />
                  ))}
                </div>
              </div>
            </div>
            <div className="socket-row">
              <div className="socket-category">
                <span>Fragments</span>
                <div className="socket-set">
                  {buildItem.fragments?.map((fragment: any, idx: number) =>(
                    <img key={`fragment-${idx}`} src={fragment?.iconUrl} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  return <div />
}

export default V3SubclassCard;
