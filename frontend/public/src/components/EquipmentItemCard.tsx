import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styled from 'styled-components'
import colors from '../colors'
import { Item, Enums  } from '../data-utils/Main'
import { ItemTierData } from '../data-utils/models/Item'

const EquipmentItemCardStyles = styled.div`
  width: 100%;
  display: flex;
  align-items: left;
  color: white;

  .item-base-stats {

    .item-tier-1 {
      color: ${colors.elements.Arc};
    }

    .item-tier-2 {
      color: ${colors.elements.Solar} !important;
    }

    .item-tier-3 {
      color: ${colors.elements.Void};
    }

    .item-tier-4 {
      color: ${colors.elements.Void};
    }

    .item-tier-6 {
      color: ${colors.elements.Stasis};
    }

    .affinity-icon {
      height: auto;
      max-width: 15px;
      margin-right: 3px;
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
    padding-bottom: 5px;
    margin-bottom: 7px;

    img {
      max-width: 25px;
      max-height: 25px;
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
  onClick?: Function
}

function EquipmentItemCard(props: EquipmentItemCardProps) {
  const { item, configurable, onConfigureItemClicked, onSwapItemClicked, showLocation, onClick } = props

  const [itemTierData, setItemTierData] = useState<ItemTierData>()

  useEffect(() => {
    setItemTierData(item.getItemTier())
  }, [])


  return (
    <EquipmentItemCardStyles className={`bg-neutral-800 border border-neutral-700 ${onClick ? 'hover:cursor-pointer hover:border-neutral-600 transition' : ''}`} onClick={onClick ? () => onClick() : undefined}>
      <div className="selected-item-left">
        <img className="selected-item-img" src={item.iconUrl} />
        <div className="item-base-stats px-2 flex justify-between text-sm mb-1">
          { itemTierData && itemTierData.icon && <img className="affinity-icon" src={itemTierData.icon} alt="Affinity Icon" /> }
          { itemTierData && itemTierData.tier !== undefined && 
            <span className={`item-tier ${item.itemType === Enums.ItemTypeEnum.Weapon ? `item-tier-${itemTierData.damageType}` : 'px-2 text-black bg-white rounded-sm'}`}>
              {itemTierData.tier}
            </span>
          }
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
              {item && item.getEquippedPerks() !== null && item?.getEquippedPerks()?.map((perk, idx) => (
                <img className="img img-fluid" src={perk.iconUrl} key={`perk-${idx}`} alt="Perk Icon" />
              ))}
            </div>
            <div className="selected-item-mods">
              {item && item.getEquippedMods() !== null && item?.getEquippedMods()?.map((mod, idx) => (
                <img className="img img-fluid" src={mod.iconUrl} key={`mod-${idx}`} alt="Mod Icon"  />
              ))}
            </div>
          </>
        )}
        {item.itemType === Enums.ItemTypeEnum.Armor && (
          <>
            <div className="selected-item-mods">
              {item && item.getEquippedMods() !== null && item?.getEquippedMods()?.map((mod, idx) => (
                <img className="img img-fluid" src={mod.iconUrl} key={`mod-${idx}`} alt="Mod Icon"  />
              ))}
            </div>
            <div className="selected-item-perks">
              {item && item.getEquippedPerks() !== null && item?.getEquippedPerks()?.map((perk, idx) => (
                <img className="img img-fluid" src={perk.iconUrl} key={`perk-${idx}`} alt="Perk Icon" />
              ))}
            </div>
          </>
        )}
      </div>
    </EquipmentItemCardStyles>
  )
}

export default EquipmentItemCard
