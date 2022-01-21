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

      .selected-tree {
        margin-left: 70px;
        margin-top: 40px;
        margin-bottom: 20px;
        transform: rotate(-45deg);
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        height: 200px;
        width: 200px;
        border: 4px solid rgba(150,150,150,0.7);

        .img-wrapper-outer {
          padding: 3px;
        }

        .img-wrapper-outer-1 {
          border-right: 6px solid white;
          border-top: 6px solid white;
          margin-right: -6px;
          margin-top: -6px;
        }

        .img-wrapper-outer-2 {
          border-left: 6px solid white;
          border-bottom: 6px solid white;
          margin-left: -6px;
          margin-bottom: -6px;
        }

        .img-wrapper-outer-3 {
          border-right: 6px solid white;
          border-bottom: 6px solid white;
          margin-right: -6px;
          margin-bottom: -6px;
        }

        .img-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid white;
          /* margin: 3px; */

          &-2 {
            background-color: ${colors.elements.Arc}
          }

          &-3 {
            background-color: ${colors.elements.Solar}
          }

          &-4 {
            background-color: ${colors.elements.Void}
          }
        }

        img {
          transform: rotate(45deg);
        }
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

enum AffinityEnum {
  Arc = 2,
  Solar = 3,
  Void = 4
}

type Props = {
  subclass: Item
}

function V2SubclassCard(props: Props) {
  const { subclass } = props
  const [specialty, setSpecialty] = useState<any>()
  const [grenade, setGrenade] = useState<any>()
  const [movement, setMovement] = useState<any>()
  const [tree, setTree] = useState<any>()
  const [affinity, setAffinity] = useState(0)

  useEffect(() => {
    let ep = subclass.getEquippedPerks()
    console.log("ep", ep)
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
  }, [subclass])

  return (
    <Wrapper>
      <div className="subclass-left">
        <img className="icon" src={subclass.iconUrl} />
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
          {tree && (
            <div className="selected-tree">
              {tree.perks.map((p: any, idx: number) => (
                <div className={`img-wrapper-outer ${tree.equippedTree === idx ? `img-wrapper-outer-${tree.equippedTree}` : ""}`}>
                  <div className={`img-wrapper img-wrapper-${affinity}`}>
                    <img src={`https://www.bungie.net${p.icon}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default V2SubclassCard;
