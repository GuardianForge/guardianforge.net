import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container, Button, Alert, ButtonGroup } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../colors'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { GlobalContext } from "../contexts/GlobalContext"
import { InventoryManager, Item, Enums  } from '@guardianforge/destiny-data-utils'
import EquipmentItem from '../components/EquipmentItem'
import Subclass from '../components/Subclass'
import { State } from '../models/Enums'
import Loading from '../components/Loading'
import ButtonBar from '../components/forms/ButtonBar'
import { faBan, faCube, faExchangeAlt, faExclamationTriangle, faEye, faEyeSlash, faMarker, faSave, faStickyNote } from '@fortawesome/free-solid-svg-icons'
import Input from '../components/forms/Input'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import YouTubeEmbed from '../components/YouTubeEmbed'
import TextArea from '../components/forms/TextArea'
import ActivitySelector from "../components/ActivitySelector"
import ActivityOption from '../models/ActivityOption'
import ModalSelector from '../components/forms/ModalSelector'
import ModalSelectorOption from '../models/ModalSelectorOption'
import Build, { BuildItem, BuildStatCollection } from "../models/Build"
import StatBar from '../components/StatBar'
import ForgeModal from '../components/Modal'
import ForgeButton from '../components/forms/Button'
import ClassCard from '../components/ClassCard'
import userUtils from '../utils/userUtils'
import BuildAd from '../components/ads/BuildAd'
import AlertDetail, { BungieOfflineAlert } from '../models/AlertDetail'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'

const Wrapper = styled.div`
  padding-bottom: 20px;

  .selected-item {

  }

  .build-info-card {
    padding: 10px;
    border-radius: 5px;
    background-color: ${colors.theme2.dark2}
  }

  .visibility-enabled {
    background-color: ${colors.theme2.accent1};
  }

  .visibility-disabled {
    background-color: ${colors.theme2.dark1};
    border-color: ${colors.theme2.dark1};
  }
`

const SelectItemButton = styled(Button)`
  width: 100%;
  display: flex !important;
  align-items: center;
  justify-content: start;
  font-size: 24px !important;
  margin-bottom: 10px;

  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
`

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function CreateBuild() {
  const { isInitDone, setPageTitle, dispatchAlert, redirectToLogin } = useContext(GlobalContext)
  const query = useQuery()
  const navigate = useNavigate()
  const [_state, setState] = useState(State.LOADING)
  const [isClassSelectModalOpen, setIsClassSelectModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Enums.ClassEnum>()
  const [selectedUser, setSelectedUser] = useState<any>()
  const [isInventoryLoaded, setIsInventoryLoaded] = useState(false)
  // const [isPrivate, setIsPrivate] = useState(false)
  const [highlights, setHighlights] = useState<Array<string>>([])
  const [isHighlightModeOn, setIsHighlightModeOn] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [visibility, setVisibility] = useState<ModalSelectorOption>({
    iconUrl: "/img/eye.png",
    value: "1",
    display: "Public"
  })

  // Build Items
  const [kinetic, setKinetic] = useState<BuildItem>()
  const [energy, setEnergy] = useState<BuildItem>()
  const [power, setPower] = useState<BuildItem>()
  const [helmet, setHelmet] = useState<BuildItem>()
  const [arms, setArms] = useState<BuildItem>()
  const [chest, setChest] = useState<BuildItem>()
  const [legs, setLegs] = useState<BuildItem>()
  const [classItem, setClassItem] = useState<BuildItem>()
  const [subclass, setSubclass] = useState<BuildItem>()
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
  const [name, setName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [stats, setStats] = useState<BuildStatCollection>(new BuildStatCollection())
  const [inputStyle, setInputStyle] = useState<ModalSelectorOption>({ value: "0", display: "None"});
  const [activity, setActivity] = useState<ActivityOption>({ value: "1", display: "Any Activity" });
  const [videoLink, setVideoLink] = useState<string>("");

  // Validateion
  const [isBuildValid, setIsBuildValid] = useState(false)
  const [weaponConfigValidationMessage, setWeaponConfigValidationMessage] = useState<string>()
  const [armorConfigValidationMessage, setArmorConfigValidationMessage] = useState<string>()

  useEffect(() => {
    console.log('sdlfksj')
    if(!isInitDone) return
    if(isInventoryLoaded) return
    async function init() {
      const { ForgeClient, BungieApiService, ManifestService } = window.services

      if(!ForgeClient.isLoggedIn()) {
        redirectToLogin()
      }
      console.log('hit!')

      // TODO: Pull this from ForgeClient user info
      let { membershipType, membershipId } = userUtils.parseMembershipFromProfile(ForgeClient.userData)
      let token = ForgeClient.getToken()

      try {
        window.services.InventoryManager = new InventoryManager(BungieApiService, ManifestService)
        await window.services.InventoryManager.loadInventory(membershipType, membershipId, token)
        setIsInventoryLoaded(true)
      } catch (err) {
        dispatchAlert(BungieOfflineAlert)
        return
      }

      if(query && query.get("guardianKey")) {
        const guardianKey = query.get("guardianKey")
        let b = await Build.FromGuardianKey(BungieApiService, ManifestService, guardianKey as string)
        if(b.items) {
          setKinetic(b.items.kinetic)
          setEnergy(b.items.energy)
          setPower(b.items.power)
          setHelmet(b.items.helmet)
          setArms(b.items.arms)
          setChest(b.items.chest)
          setLegs(b.items.legs)
          setClassItem(b.items.classItem)
          setSubclass(b.items.subclass)
        }
        if(b.stats) {
          setStats(b.stats)
        }
        if(b.name) {
          setName(b.name)
        }
        setSelectedUser(b.selectedUser)
        setSelectedClass(b.class)
        setIsBuildValid(true)

        if(b.selectedUser?.bungieNetUserId === ForgeClient.userData.bungieNetUser.membershipId) {
          setIsOwner(true)
        }
        setState(State.DONE)
      } else {
        setIsClassSelectModalOpen(true)
        setIsOwner(true)
      }
    }
    init()
  }, [isInitDone])

  function resetBuild() {
    setKinetic(undefined)
    setEnergy(undefined)
    setPower(undefined)
    setHelmet(undefined)
    setArms(undefined)
    setChest(undefined)
    setLegs(undefined)
    setClassItem(undefined)
    setSubclass(undefined)
    setHighlights([])
    setVisibility({
      iconUrl: "/img/eye.png",
      value: "1",
      display: "Public"
    })
    setName("")
    setNotes("")
    setStats(new BuildStatCollection())
    setInputStyle({ value: "0", display: "None"});
    setActivity({ value: "1", display: "Any Activity" });
    setBuildData({
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
    setVideoLink("")
  }

  function onItemUpdated(item: Item) {
    let bd = buildData
    switch(item.slot) {
      case Enums.BucketTypeEnum.Kinetic:
        setKinetic(BuildItem.FromItem(item))
        bd.items.kinetic = item;
        break;
      case Enums.BucketTypeEnum.Energy:
        setEnergy(BuildItem.FromItem(item))
        bd.items.energy = item;
        break;
      case Enums.BucketTypeEnum.Power:
        setPower(BuildItem.FromItem(item))
        bd.items.power = item;
        break;
      case Enums.BucketTypeEnum.Helmet:
        setHelmet(BuildItem.FromItem(item))
        bd.items.helmet = item;
        break;
      case Enums.BucketTypeEnum.Arms:
        setArms(BuildItem.FromItem(item))
        bd.items.arms = item;
        break;
      case Enums.BucketTypeEnum.Chest:
        setChest(BuildItem.FromItem(item))
        bd.items.chest = item;
        break;
      case Enums.BucketTypeEnum.Legs:
        setLegs(BuildItem.FromItem(item))
        bd.items.legs = item;
        break;
      case Enums.BucketTypeEnum.ClassItem:
        setClassItem(BuildItem.FromItem(item))
        bd.items.classItem = item;
        break;
      case Enums.BucketTypeEnum.Subclass:
        setSubclass(BuildItem.FromItem(item))
        bd.items.subclass = item;
        break;
    }

    // TODO: Convert this to track stats only
    setBuildData(bd)

    // Validate build
    // - Weapons can only contain one exotic
    let weaponExoticCount = 0
    let isWeaponConfigValid = false
    if(bd.items.kinetic && bd.items.kinetic.isExotic) weaponExoticCount++;
    if(bd.items.energy && bd.items.energy.isExotic) weaponExoticCount++;
    if(bd.items.power && bd.items.power.isExotic) weaponExoticCount++;
    if(weaponExoticCount > 1) {
      setWeaponConfigValidationMessage("You may only equip one Exotic weapon at a time.")
    } else {
      isWeaponConfigValid = true
      setWeaponConfigValidationMessage("")
    }

    // - Armor can only containe ONE exotic
    let armorExoticCount = 0
    let isArmorConfigValid = false
    if(bd.items.helmet && bd.items.helmet.isExotic) armorExoticCount++;
    if(bd.items.arms && bd.items.arms.isExotic) armorExoticCount++;
    if(bd.items.chest && bd.items.chest.isExotic) armorExoticCount++;
    if(bd.items.legs && bd.items.legs.isExotic) armorExoticCount++;
    if(bd.items.classItem && bd.items.classItem.isExotic) armorExoticCount++;
    if(armorExoticCount > 1) {
      setArmorConfigValidationMessage("You may only equip one Exotic armor piece at a time.")
    } else {
      isArmorConfigValid = true
      setArmorConfigValidationMessage("")
    }

    let isValid = true
    if(!bd.items.subclass) isValid = false
    if(!bd.items.kinetic) isValid = false
    if(!bd.items.energy) isValid = false
    if(!bd.items.power) isValid = false
    if(!bd.items.helmet) isValid = false
    if(!bd.items.arms) isValid = false
    if(!bd.items.chest) isValid = false
    if(!bd.items.legs) isValid = false
    if(!bd.items.classItem) isValid = false
    setIsBuildValid(isValid && isArmorConfigValid && isWeaponConfigValid)

    // Calculate stats
    let stats = calculateStats(bd)
    setStats(stats)
  }

  function calculateStats(buildData: any): BuildStatCollection {
    let stats = new BuildStatCollection()

    Object.keys(buildData.items).forEach((k: string) => {
      let item = buildData.items[k] as Item
      if(item && item.stats) {
        // @ts-ignore TODO: useDownlevelIterations
        for(let k2 of item.stats.keys()) {
          if(item && item.stats && item.stats.get(k2)) {
            // @ts-ignore
            let val = item.stats.get(k2).value
            switch(k2) {
              case "Discipline":
                // @ts-ignore
                stats.discipline.value += val;
                break;
              case "Intellect":
                // @ts-ignore
                stats.intellect.value += val;
                break;
              case "Mobility":
                // @ts-ignore
                stats.mobility.value += val;
                break;
              case "Strength":
                // @ts-ignore
                stats.strength.value += val;
                break;
              case "Resilience":
                // @ts-ignore
                stats.resilience.value += val;
                break;
              case "Recovery":
                // @ts-ignore
                stats.recovery.value += val;
                break;
            }
          }
        }
      }
    })
    return stats
  }

  async function onSaveClicked() {
    let { ForgeApiService, ForgeClient } = window.services

    let build = new Build()
    build.notes = notes;
    build.name = name;
    build.class = selectedClass;
    build.stats = stats
    build.highlights = highlights

    if(selectedUser) {
      build.selectedUser = selectedUser
    }

    if(videoLink) {
      build.videoLink = videoLink
    }

    if(inputStyle.value !== "0") {
      build.inputStyle = inputStyle.value
    }

    if(activity.value !== "0") {
      build.primaryActivity = activity.value
    }

    if(visibility.value === "0") {
      build.isPrivate = true
    }

    if(ForgeClient.userData && ForgeClient.userData.bungieNetUser) {
      const { membershipId, bungieGlobalDisplayName, bungieGlobalDisplayNameCode, cachedBungieGlobalDisplayName, cachedBungieGlobalDisplayNameCode } = ForgeClient.userData.bungieNetUser
      build.createdBy = membershipId

      if(!build.selectedUser && bungieGlobalDisplayName && bungieGlobalDisplayNameCode) {
        build.selectedUser = {
          displayName: `${bungieGlobalDisplayName}#${bungieGlobalDisplayNameCode}`,
          bungieNetUserId: ForgeClient.userData.bungieNetUser.membershipId
        }
      }

      if(!build.selectedUser && cachedBungieGlobalDisplayName && cachedBungieGlobalDisplayNameCode) {
        build.selectedUser = {
          displayName: `${cachedBungieGlobalDisplayName}#${cachedBungieGlobalDisplayNameCode}`,
          bungieNetUserId: ForgeClient.userData.bungieNetUser.membershipId
        }
      }
    }

    build.items = {
      subclass,
      kinetic,
      energy,
      power,
      helmet,
      arms,
      chest,
      legs,
      classItem
    }

    try {
      setState(State.SAVING)

      // TODO: Move this into the new Client
      let token = ForgeClient.getToken()
      const buildId = await ForgeApiService.createBuild(build, token)
      let buildSummary = build.toBuildSummary(buildId)
      ForgeClient.userBuilds.push(buildSummary)

      navigate(`/app/build/${buildId}`)
    } catch(err) {
      let alert = new AlertDetail("An error occurred while saving this build. Please try again later...", "Saving Build", true, false)
      dispatchAlert(alert)
      setState(State.DONE)
    }
  }

  function onClassSelected(classType: Enums.ClassEnum) {
    const { ForgeClient } = window.services
    resetBuild();
    setSelectedClass(classType)
    let className = ""
    if(classType === Enums.ClassEnum.Titan) {
      className = "Titan"
    }
    if(classType === Enums.ClassEnum.Hunter) {
      className = "Hunter"
    }
    if(classType === Enums.ClassEnum.Warlock) {
      className = "Warlock"
    }
    if(ForgeClient && ForgeClient.userData && ForgeClient.userData.bungieNetUser) {
      setName(`${ForgeClient.userData.bungieNetUser.uniqueName}'s ${className}`)
    }
    setIsClassSelectModalOpen(false)
    setState(State.DONE)
  }

  const classOptions: Array<any> = [
    {
      name: "Titan",
      value: Enums.ClassEnum.Titan
    },
    {
      name: "Hunter",
      value: Enums.ClassEnum.Hunter
    },
    {
      name: "Warlock",
      value: Enums.ClassEnum.Warlock
    }
  ]

  function updateHighlights(key: string) {
    let _highlights = highlights
    if(_highlights.find(el => el === key)) {
      _highlights = _highlights.filter(el => el !== key)
    } else {
      _highlights.push(key)
    }
    setHighlights([..._highlights])
    console.log(highlights)
  }

  const inputStyleOptions: Array<ModalSelectorOption> = [
    {
      iconUrl: "/img/input-icons/mnk.png",
      value: "1",
      display: "Mouse & Keyboard"
    },
    {
      iconUrl: "/img/input-icons/controller.png",
      value: "2",
      display: "Controller"
    }
  ]

  const visibilityOptions: Array<ModalSelectorOption> = [
    {
      iconUrl: "/img/eye.png",
      value: "1",
      display: "Public"
    },
    {
      iconUrl: "/img/eye-slash.png",
      value: "0",
      display: "Private"
    },
  ]

  function handleCloseSelectClassModal() {
    if(selectedClass === undefined) {
      navigate("/")
    } else {
      setIsClassSelectModalOpen(false)
    }
  }

  return (
    <MainLayout wide>
      <Wrapper>
        {_state === State.LOADING && (
          <Loading />
        )}
        {(_state === State.DONE || _state === State.SAVING) && (
          <div>
            <div className='flex flex-col md:flex-row md:items-center border-b border-b-neutral-800 md:border-b-0 mb-2'>
              <h1 className='flex-1'>Create Build</h1>
              <ButtonBar className='grid grid-cols-2 gap-2 md:flex'>
                <ForgeButton onClick={onSaveClicked} disabled={!isBuildValid || _state === State.SAVING}>
                  <FontAwesomeIcon icon={faSave} />Save
                </ForgeButton>
                <ForgeButton onClick={() => setIsClassSelectModalOpen(true)} disabled={_state === State.SAVING}>
                  <FontAwesomeIcon icon={faExchangeAlt} /> Change Class
                </ForgeButton>
                {isHighlightModeOn ? (
                  <ForgeButton onClick={() => setIsHighlightModeOn(false)}>
                    <FontAwesomeIcon icon={faBan} /> Exit Highlight Mode
                  </ForgeButton>
                ) : (
                  <ForgeButton onClick={() => setIsHighlightModeOn(true)}>
                    <FontAwesomeIcon icon={faMarker} /> Highlight Mode
                  </ForgeButton>
                )}
              </ButtonBar>
            </div>

            <div className='grid md:grid-cols-3 xl:grid-cols-4 gap-2'>
              {/* Build info block (mobile) */}
              <div className='block xl:hidden col-span-3'>
                <h4>Build Info</h4>
                <Card className="mb-4">
                  <Row>
                    <Col md="4" sm="6">
                      <span>Name</span>
                      <Input
                        prefixIcon={faCube}
                        placeholder='Give your build a name'
                        value={name}
                        onChange={(e: any) => setName(e.target.value)}
                        className="mb-3" />
                      <span>Notes</span>
                      <TextArea
                        className="mb-3"
                        prefixIcon={faStickyNote}
                        rows={10}
                        placeholder="Add some notes on how to use the build"
                        value={notes}
                        onChange={(e: any) => setNotes(e.target.value)}/>
                    </Col>
                    <Col md="4" sm="6">
                      <span>Primary Activity</span>
                      <ActivitySelector
                        className="mb-3"
                        value={activity}
                        onChange={(opt: ActivityOption) => setActivity(opt)} />
                      <span>Input Style</span>
                      <ModalSelector
                        title="Input Style"
                        className="mb-3"
                        options={inputStyleOptions}
                        value={inputStyle}
                        onChange={(opt: ModalSelectorOption) => setInputStyle(opt)} />
                      <span>Visibility</span>
                      <ModalSelector
                        title="Visibility"
                        className="mb-3"
                        options={visibilityOptions}
                        value={visibility}
                        onChange={(opt: ModalSelectorOption) => setVisibility(opt)} />
                    </Col>
                    <Col md="4" sm="6">
                      <span>Video Review</span>
                      <Input
                        prefixIcon={faYoutube}
                        placeholder="Add a YouTube link"
                        value={videoLink}
                        className="mb-3"
                        onChange={(e: any) => setVideoLink(e.target.value)} />
                      <YouTubeEmbed youtubeUrl={videoLink} showPlaceholder />
                    </Col>
                  </Row>
                </Card>
              </div>

              {/* Build info block (desktop) */}
              <div className="hidden xl:flex h-100 flex-col">
                <h4>Build Info</h4>
                <Card className="flex-1">
                  <span>Name</span>
                  <Input
                    prefixIcon={faCube}
                    placeholder='Give your build a name'
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    className="mb-3" />
                  <span>Notes</span>
                  <TextArea
                    className="mb-3"
                    prefixIcon={faStickyNote}
                    rows={10}
                    placeholder="Add some notes on how to use the build"
                    value={notes}
                    onChange={(e: any) => setNotes(e.target.value)}/>
                  <span>Primary Activity</span>
                  <ActivitySelector
                    className="mb-3"
                    value={activity}
                    onChange={(opt: ActivityOption) => setActivity(opt)} />
                  <span>Input Style</span>
                  <ModalSelector
                    title="Input Style"
                    className="mb-3"
                    options={inputStyleOptions}
                    value={inputStyle}
                    onChange={(opt: ModalSelectorOption) => setInputStyle(opt)} />
                  <span>Visibility</span>
                  <ModalSelector
                    title="Visibility"
                    className="mb-3"
                    options={visibilityOptions}
                    value={visibility}
                    onChange={(opt: ModalSelectorOption) => setVisibility(opt)} />
                  <span>Video Review</span>
                  <Input
                    prefixIcon={faYoutube}
                    placeholder="Add a YouTube link"
                    value={videoLink}
                    className="mb-3"
                    onChange={(e: any) => setVideoLink(e.target.value)} />
                  <YouTubeEmbed youtubeUrl={videoLink} showPlaceholder />
                </Card>

              </div>

              <div className='col-span-3 grid md:grid-cols-3 gap-2'>
                <div>
                  <h4>Class</h4>
                  <ClassCard classType={selectedClass} />
                </div>

                <div className='md:col-span-2'>
                  <h4>Stats</h4>
                  <StatBar stats={stats} highlights={highlights} isHighlightable={isHighlightModeOn} onHighlightableClicked={updateHighlights} />
                </div>

                <div className='md:col-span-3'>
                  <h4>Subclass</h4>
                  <Subclass
                    className='mb-2'
                    buildItem={subclass}
                    onSubclassUpdated={onItemUpdated}
                    selectedClass={selectedClass}
                    configurable={isOwner}
                    highlights={highlights}
                    isHighlightModeOn={isHighlightModeOn}
                    onHighlightableClicked={updateHighlights} />
                </div>

                <div className='md:col-span-3'>
                  <h4>Weapons</h4>
                  {weaponConfigValidationMessage && <span><FontAwesomeIcon icon={faExclamationTriangle} color="yellow" />{weaponConfigValidationMessage}</span>}
                </div>

                <EquipmentItem buildItem={kinetic}
                  slot={Enums.BucketTypeEnum.Kinetic}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn}
                  onHighlightableClicked={updateHighlights} />

                <EquipmentItem buildItem={energy}
                  slot={Enums.BucketTypeEnum.Energy}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <EquipmentItem buildItem={power}
                  slot={Enums.BucketTypeEnum.Power}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <div className="md:col-span-3">
                  <h4>Armor</h4>
                  {armorConfigValidationMessage && <span><FontAwesomeIcon icon={faExclamationTriangle} color="yellow" />{armorConfigValidationMessage}</span>}
                </div>

                <EquipmentItem buildItem={helmet}
                  slot={Enums.BucketTypeEnum.Helmet}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <EquipmentItem buildItem={arms}
                  slot={Enums.BucketTypeEnum.Arms}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <EquipmentItem buildItem={chest}
                  slot={Enums.BucketTypeEnum.Chest}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <EquipmentItem buildItem={legs}
                  slot={Enums.BucketTypeEnum.Legs}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />

                <EquipmentItem buildItem={classItem}
                  slot={Enums.BucketTypeEnum.ClassItem}
                  classType={selectedClass}
                  onItemUpdated={onItemUpdated}
                  highlights={highlights}
                  onHighlightableClicked={updateHighlights}
                  configurable={isOwner}
                  isHighlightModeOn={isHighlightModeOn} />
              </div>


            </div>

            <BuildAd />
          </div>
        )}

      <ForgeModal
        show={isClassSelectModalOpen}
        title="Select Class"
        footer={<ForgeButton onClick={handleCloseSelectClassModal}>Close</ForgeButton>}>
          {classOptions.map((el: any, idx: number) => (
            <SelectItemButton key={`classopt-${idx}`} className="class-option rounded-none border border-neutral-700 hover:bg-neutral-800" onClick={() => onClassSelected(el.value)}>
              {el.iconUrl && <img className="classopt-icon" src={el.iconUrl} />}
              { el.name }
            </SelectItemButton>
          ))}
          {selectedClass !== undefined ? (
            <Alert variant="warning">
              Changing classes will reset the current build configuration.
            </Alert>
          ) : (
            <Alert variant="warning">
              Closing this modal before selecting a class will return you to the home page.
            </Alert>
          )}
        </ForgeModal>
      </Wrapper>
    </MainLayout>
  )
}

export default CreateBuild
