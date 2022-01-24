import { faCog, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Item } from '@guardianforge/destiny-data-utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import colors from '../../colors';

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

type Props = {
  subclass: Item
  onSubclassUpdated: Function
  onChangeSubclassClicked: React.MouseEventHandler
}

function V3SubclassCard(props: Props) {
  const { subclass, onSubclassUpdated, onChangeSubclassClicked } = props
  const [isConfigureSubclassModalShown, setIsConfigureSubclassModalShown] = useState(false)

  function onConfigureSubclassClicked() {
    setIsConfigureSubclassModalShown(true)
  }

  return (
    <Wrapper>
      <div className="subclass-left">
        <img className="icon" src={subclass.iconUrl} />
        {/* // TODO: Stat bumps */}

        <div className="icon-btns">
          <FontAwesomeIcon icon={faCog} onClick={onConfigureSubclassClicked} />
          <FontAwesomeIcon icon={faExchangeAlt} onClick={onChangeSubclassClicked} />
        </div>
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
    </Wrapper>
  )
}

export default V3SubclassCard;
