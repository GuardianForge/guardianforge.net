import React, { useContext, useEffect, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// @ts-ignore
import { GlobalContext } from '../../contexts/GlobalContext'
import { InventoryManager, Item, Enums, SocketItem, Socket  } from '@guardianforge/destiny-data-utils'
import EquipmentItem from './components/EquipmentItem'
import EquipmentItemCard from './components/EquipmentItemCard'
import Subclass from './components/Subclass'

const Wrapper = styled.div`
  padding: 20px;

  .selected-item {

  }

  .build-info-card {
    padding: 10px;
    border-radius: 5px;
    background-color: ${colors.theme2.dark2}
  }
`

type BuildItemCollection = {
  kinetic?: Item
  energy?: Item
  power?: Item
  helmet?: Item
  arms?: Item
  chest?: Item
  legs?: Item
  classItem?: Item
}

type Build = {
  items?: BuildItemCollection
}

function CreateBuild() {
  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [selectedClass, setSelectedClass] = useState<Enums.ClassEnum>(0)
  const [isInventoryLoaded, setIsInventoryLoaded] = useState(false)
  const [buildData, setBuildData] = useState<any>({
    items: {
      kinetic: {},
      energy: {},
      power: {},
      helmet: {},
      arms: {},
      chest: {},
      legs: {},
      classItem: {},
    }
  })

  useEffect(() => {
    setPageTitle("Create Build")
    if(!isInitDone) return
    if(isInventoryLoaded) return
    async function init() {
      // @ts-ignore
      const { ForgeClient, BungieApiService, ManifestService } = window.services

      // TODO: Pull this from ForgeClient user info
      const membershipType = 2
      const membershipId = "4611686018462801516"
      let token = await ForgeClient.getToken()
      let data = await BungieApiService.fetchUserInventory(token, membershipType, membershipId)

      // @ts-ignore
      window.services.InventoryManager = new InventoryManager(BungieApiService, ManifestService)
      // @ts-ignore
      window.services.InventoryManager.loadInventory(data)
      setIsInventoryLoaded(true)
    }
    init()
  }, [isInitDone])

  function onItemUpdated(item: Item) {
    console.log("onItemUpdated", item)
    let bd = buildData
    switch(item.slot) {
      case Enums.BucketTypeEnum.Kinetic:
        bd.items.kinetic = item;
        break;
      case Enums.BucketTypeEnum.Energy:
        bd.items.energy = item;
        break;
      case Enums.BucketTypeEnum.Power:
        bd.items.power = item;
        break;
      case Enums.BucketTypeEnum.Helmet:
        bd.items.helmet = item;
        break;
      case Enums.BucketTypeEnum.Arms:
        bd.items.arms = item;
        break;
      case Enums.BucketTypeEnum.Chest:
        bd.items.chest = item;
        break;
      case Enums.BucketTypeEnum.Legs:
        bd.items.legs = item;
        break;
      case Enums.BucketTypeEnum.ClassItem:
        bd.items.classItem = item;
        break;
    }
    console.log("bd", buildData)
    setBuildData(bd)
  }

  return (
    <Wrapper>
      {/* <h1>Create Build</h1> */}
      <Row>
        <Col md="9">
          <div className="row">
            <div className="col-md-12">
              <h4>Subclass</h4>
            </div>
            <div className="col-md-12">
              <Subclass />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mt-3">
              <h4>Weapons</h4>
            </div>
            <div className="col-md-4">
              <EquipmentItem item={buildData.items.kinetic} slot={Enums.BucketTypeEnum.Kinetic} classType={selectedClass} onItemUpdated={onItemUpdated}>
                Select Kinetic
              </EquipmentItem>
            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.energy && (
                <EquipmentItem item={buildData.items.energy} slot={Enums.BucketTypeEnum.Energy} classType={selectedClass}  onItemUpdated={onItemUpdated}>
                  Select Energy
                </EquipmentItem>
              )}
            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.power && (
                <EquipmentItem item={buildData.items.power} slot={Enums.BucketTypeEnum.Power} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Power
                </EquipmentItem>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mt-3">
              <h4>Armor</h4>
            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.helmet && (
                <EquipmentItem  item={buildData.items.helmet} slot={Enums.BucketTypeEnum.Helmet} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Helmet
                </EquipmentItem>
              )}
            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.arms && (
                <EquipmentItem item={buildData.items.arms} slot={Enums.BucketTypeEnum.Arms} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Arms
                </EquipmentItem>
              )}

            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.chest && (
                <EquipmentItem item={buildData.items.chest} slot={Enums.BucketTypeEnum.Chest} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Chest
                </EquipmentItem>
              )}

            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.legs && (
                <EquipmentItem item={buildData.items.legs} slot={Enums.BucketTypeEnum.Legs} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Legs
                </EquipmentItem>
              )}
            </div>
            <div className="col-md-4">
              {buildData.items && buildData.items.classItem && (
                <EquipmentItem item={buildData.items.classItem} slot={Enums.BucketTypeEnum.ClassItem} classType={selectedClass} onItemUpdated={onItemUpdated}>
                  Select Class Item
                </EquipmentItem>
              )}
            </div>
          </div>
        </Col>
        <Col md="3">
          <h4>Build Info</h4>
          <div className="build-info-card">
            Misc info here
          </div>
        </Col>
      </Row>
    </Wrapper>
  )
}

export default CreateBuild
