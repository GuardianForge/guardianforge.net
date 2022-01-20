import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styled from 'styled-components'
import colors from '../../../colors'
import { Item, Enums  } from '@guardianforge/destiny-data-utils'

const EquipmentItemCardStyles = styled.div`
  width: 100%;
  display: flex;
  align-items: left;
  background-color: ${colors.theme2.dark2};
  color: white;
  border-radius: 5px;
  padding-bottom: 10px;

  .item-base-stats {
    margin: 0px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .affinity-icon {
      height: auto;
      max-width: 15px;
    }
  }

  .selected-item-left {
    display: flex;
    flex-direction: column;
  }

  .item-buttons {
    height: auto;
    display: flex;
    align-items: end;
    flex: 1;
    padding: 10px;

    svg {
      height: 20px;
      width: 20px;
      margin-right: 10px;
      &:hover {
        cursor: pointer;
      }
    }
  }

  .selected-item-img {
    margin: 10px;
    border-radius: 5px;
    max-width: 70px;
    max-height: 70px;
  }

  .selected-item-data {
    flex: 1;
    margin: 10px;

    .selected-item-perks {
      display: flex;

      .perk-column {
        display: flex;
        flex-direction: column;
      }

      img {
        max-width: 40px;
        margin: 0px 3px 3px 0px;
        border-radius: 100px !important;
        padding: 3px !important;
        border: 2px solid #444;
      }
    }

    .selected-item-mods {
      display: flex;

      img {
        max-width: 40px;
        margin: 0px 3px 3px 0px;
        border-radius: 5px !important;
      }
    }
  }
  .selected-item-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid ${colors.theme2.dark1};
    margin-bottom: 7px;

    img {
      max-width: 25px;
      height: auto;
      border-radius: 5px;
    }
  }

  .selected-item-name {
    font-weight: bold;
  }
`

type EquipmentItemCardProps = {
  item: Item
  configurable?: boolean
  onConfigureItemClicked?: Function
  onSwapItemClicked?: Function
  showLocation?: boolean
}


function EquipmentItemCard(props: EquipmentItemCardProps) {
  const { item, configurable, onConfigureItemClicked, onSwapItemClicked, showLocation } = props

  return (
    <EquipmentItemCardStyles>
      <div className="selected-item-left">
        <img className="selected-item-img" src={item.iconUrl} />
        <div className="item-base-stats">
          <span>{ item.getAffinityIcon() && <img className="affinity-icon" src={item.getAffinityIcon() as string} /> }</span>
          <span>{ item.getPower() }</span>
        </div>
        {configurable && (
          <div className="item-buttons">
            <FontAwesomeIcon onClick={() => onConfigureItemClicked ? onConfigureItemClicked() : null} icon="cog"/>
            <FontAwesomeIcon onClick={() => onSwapItemClicked ? onSwapItemClicked() : null} icon="exchange-alt"/>
          </div>
        )}
      </div>
      <div className="selected-item-data">
        <div className="selected-item-header">
          <div className="selected-item-name">
            { item.name }
          </div>
          {showLocation && item.isVaulted && <img className="location-icon" src="/img/vault.png"/>}
          {showLocation && item.location && item.location.emblemPath && <img src={`https://www.bungie.net${item.location.emblemPath}`} />}
        </div>
        {item.itemType === Enums.ItemTypeEnum.Weapon && (
          <>
            <div className="selected-item-perks">
              {item && item.getEquippedPerks() !== null && item?.getEquippedPerks()?.map(perk => (
                <img className="img img-fluid" src={perk.iconUrl} />
              ))}
            </div>
            <div className="selected-item-mods">
              {item && item.getEquippedMods() !== null && item?.getEquippedMods()?.map(mod => (
                <img className="img img-fluid" src={mod.iconUrl} />
              ))}
            </div>
          </>
        )}
        {item.itemType === Enums.ItemTypeEnum.Armor && (
          <>
            <div className="selected-item-mods">
              {item && item.getEquippedMods() !== null && item?.getEquippedMods()?.map(mod => (
                <img className="img img-fluid" src={mod.iconUrl} />
              ))}
            </div>
            <div className="selected-item-perks">
              {item && item.getEquippedPerks() !== null && item?.getEquippedPerks()?.map(perk => (
                <img className="img img-fluid" src={perk.iconUrl} />
              ))}
            </div>
          </>
        )}
      </div>
    </EquipmentItemCardStyles>
  )
}

export default EquipmentItemCard
