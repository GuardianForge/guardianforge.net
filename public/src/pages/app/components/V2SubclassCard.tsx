import { Item } from '@guardianforge/destiny-data-utils';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import colors from '../../../colors';


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
}

function V2SubclassCard(props: Props) {
  const { subclass } = props
  const [specialty, setSpecialty] = useState<any>()
  const [grenade, setGrenade] = useState<any>()
  const [movement, setMovement] = useState<any>()

  useEffect(() => {
    let ep = subclass.getEquippedPerks()
    console.log("ep", ep)
    setSpecialty(subclass.getEquippedClassSpecialty())
    setGrenade(subclass.getEquippedGrenade())
    setMovement(subclass.getEquippedMovementMode())

    let tree = subclass.getEquippedSuperTree()
    console.log(tree)
  })

  return (
    <Wrapper>
      <div className="subclass-left">
        <img className="icon" src={subclass.iconUrl} />
      </div>
      <div className="subclass-right">
        <span className="name">{ subclass.name }</span>
        <div>
          {specialty && <img src={`https://www.bungie.net${specialty.icon}`} />}
          {grenade && <img src={`https://www.bungie.net${grenade.icon}`} />}
          {movement && <img src={`https://www.bungie.net${movement.icon}`} />}
        </div>
      </div>
    </Wrapper>
  )
}

export default V2SubclassCard;
