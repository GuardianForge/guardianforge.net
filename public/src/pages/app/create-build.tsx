import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container, Button } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// @ts-ignore
import { GlobalContext } from "../../contexts/GlobalContext.jsx"
import { InventoryManager, Item, Enums  } from '@guardianforge/destiny-data-utils'
import EquipmentItem from '../../components/app/EquipmentItem'
import Subclass from '../../components/app/Subclass'
import { State } from '../../models/Enums'
import Loading from '../../components/app/Loading'
import ButtonBar from '../../components/app/forms/ButtonBar'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Input from '../../components/app/forms/Input'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import YouTubeEmbed from '../../components/app/YouTubeEmbed'

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

type Props = {
  location?: any
}

function CreateBuild(props: Props) {
  const { location } = props

  const { isInitDone, setPageTitle } = useContext(GlobalContext)
  const [_state, setState] = useState(State.LOADING)
  const [selectedClass, setSelectedClass] = useState<Enums.ClassEnum>(0)
  const [isInventoryLoaded, setIsInventoryLoaded] = useState(false)
  const [buildData, setBuildData] = useState<any>({
    items: {
      subclass: null,
      kinetic: null,
      energy: null,
      power: null,
      helmet: null,
      arms: null,
      chest: null,
      legs: null,
      classItem: null,
    }
  })

  // Meta
  const [name, setName] = useState<string>();
  const [notes, setNotes] = useState<string>();
  const [inputStype, setInputStyle] = useState<number>();
  const [activity, setActivity] = useState<string>();
  const [videoReviewUrl, setVideoReviewUrl] = useState<string>("");

  // Validateion
  const [isBuildValid, setIsBuildValid] = useState(false)
  const [isWeaponConfigValid, setIsWeaponConfigValid] = useState(false)
  const [weaponConfigValidationMessage, setWeaponConfigValidationMessage] = useState<string>()
  const [isArmorConfigValid, setIsArmorConfigValid] = useState(false)
  const [armorConfigValidationMessage, setArmorConfigValidationMessage] = useState<string>()

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

      // @ts-ignore
      window.services.InventoryManager = new InventoryManager(BungieApiService, ManifestService)
      // @ts-ignore
      await window.services.InventoryManager.loadInventory(membershipType, membershipId, token)
      setIsInventoryLoaded(true)

      if(location.state && location.state.guardianKey) {
        console.log("initializing from existing guardian", location.state.guardianKey)
      }
      setState(State.DONE)
    }
    init()
  }, [isInitDone])

  function onItemUpdated(item: Item) {
    console.log(item)
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
      case Enums.BucketTypeEnum.Subclass:
        bd.items.subclass = item;
        break;
    }
    console.log("bd", buildData)
    setBuildData(bd)

    // Validate build
    // - Weapons can only contain one exotic
    let weaponExoticCount = 0
    if(bd.items.kinetic && bd.items.kinetic.isExotic) weaponExoticCount++;
    if(bd.items.energy && bd.items.energy.isExotic) weaponExoticCount++;
    if(bd.items.power && bd.items.power.isExotic) weaponExoticCount++;
    if(weaponExoticCount > 1) {
      setIsWeaponConfigValid(false)
      setWeaponConfigValidationMessage("You may only equip one Exotic weapon at a time.")
    } else {
      setIsWeaponConfigValid(true)
      setWeaponConfigValidationMessage("")
    }

    // - Armor can only containe ONE exotic
    let armorExoticCount = 0
    if(bd.items.helmet && bd.items.helmet.isExotic) armorExoticCount++;
    if(bd.items.arms && bd.items.arms.isExotic) armorExoticCount++;
    if(bd.items.chest && bd.items.chest.isExotic) armorExoticCount++;
    if(bd.items.legs && bd.items.legs.isExotic) armorExoticCount++;
    if(bd.items.classItem && bd.items.classItem.isExotic) armorExoticCount++;
    if(armorExoticCount > 1) {
      setIsArmorConfigValid(false)
      setArmorConfigValidationMessage("You may only equip one Exotic armor piece at a time.")
    } else {
      setIsArmorConfigValid(true)
      setArmorConfigValidationMessage("")
    }

    validateBuildData()
  }

  function validateBuildData() {
    let isValid = true
    if(!buildData.items.subclass) isValid = false
    if(!buildData.items.kinetic) isValid = false
    if(!buildData.items.energy) isValid = false
    if(!buildData.items.power) isValid = false
    if(!buildData.items.helmet) isValid = false
    if(!buildData.items.arms) isValid = false
    if(!buildData.items.chest) isValid = false
    if(!buildData.items.legs) isValid = false
    if(!buildData.items.classItem) isValid = false
    setIsBuildValid(isValid && isArmorConfigValid && isWeaponConfigValid)
  }

  return (
    <Wrapper>
      {_state === State.LOADING && (
        <Loading />
      )}
      {_state === State.DONE && (
        <Container fluid>
          <Row>
            <Col>
              <ButtonBar>
                <Button disabled={!isBuildValid}>Save</Button>
                <Button>Optimize</Button>
                {/* <Seperator vertical />
                <div>
                  Status messages on build setup
                </div> */}
              </ButtonBar>
            </Col>
          </Row>
          <Row>
            <Col md="9">
              <Row className="mb-3">
                <Col md="12">
                  <h4>Subclass</h4>
                </Col>
                <Col md="12">
                  <Subclass onSubclassUpdated={onItemUpdated} />
                </Col>
              </Row>

              <Row>
                <Col md="12">
                  <h4>Weapons</h4>
                  {weaponConfigValidationMessage && <span><FontAwesomeIcon icon={faExclamationTriangle} color="yellow" />{weaponConfigValidationMessage}</span>}
                </Col>
                <Col md="4">
                  <EquipmentItem item={buildData.items.kinetic} slot={Enums.BucketTypeEnum.Kinetic} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Kinetic
                  </EquipmentItem>
                </Col>
                <Col md="4">
                  <EquipmentItem item={buildData.items.energy} slot={Enums.BucketTypeEnum.Energy} classType={selectedClass}  onItemUpdated={onItemUpdated}>
                    Select Energy
                  </EquipmentItem>
                </Col>
                <Col md="4">
                  <EquipmentItem item={buildData.items.power} slot={Enums.BucketTypeEnum.Power} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Power
                  </EquipmentItem>
                </Col>
              </Row>

              <div className="row">
                <div className="col-md-12 mt-3">
                  <h4>Armor</h4>
                  {armorConfigValidationMessage && <span><FontAwesomeIcon icon={faExclamationTriangle} color="yellow" />{armorConfigValidationMessage}</span>}
                </div>
                <div className="col-md-4">
                  <EquipmentItem  item={buildData.items.helmet} slot={Enums.BucketTypeEnum.Helmet} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Helmet
                  </EquipmentItem>
                </div>
                <div className="col-md-4">
                  <EquipmentItem item={buildData.items.arms} slot={Enums.BucketTypeEnum.Arms} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Arms
                  </EquipmentItem>
                </div>
                <div className="col-md-4">
                  <EquipmentItem item={buildData.items.chest} slot={Enums.BucketTypeEnum.Chest} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Chest
                  </EquipmentItem>
                </div>
                <div className="col-md-4">
                  <EquipmentItem item={buildData.items.legs} slot={Enums.BucketTypeEnum.Legs} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Legs
                  </EquipmentItem>
                </div>
                <div className="col-md-4">
                  <EquipmentItem item={buildData.items.classItem} slot={Enums.BucketTypeEnum.ClassItem} classType={selectedClass} onItemUpdated={onItemUpdated}>
                    Select Class Item
                  </EquipmentItem>
                </div>
              </div>
            </Col>
            <Col md="3">
              <h4>Notes & Play Style</h4>
              <div className="build-info-card mb-3">
                TODO: Notes
                TODO: Input Stype
                TODO: Activity
              </div>
              <h4>Video Review</h4>
              <div className="build-info-card">
                <Input
                  prefixIcon={faYoutube}
                  placeholder="Add a YouTube link"
                  value={videoReviewUrl}
                  className="mb-3"
                  onChange={(e: any) => setVideoReviewUrl(e.target.value)} />
                <YouTubeEmbed youtubeUrl={videoReviewUrl} showPlaceholder />
              </div>
            </Col>
          </Row>

        </Container>
      )}
    </Wrapper>
  )
}

export default CreateBuild
