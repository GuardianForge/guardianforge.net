function getHighlightIcon(build, highlight) {
  let split = highlight.split("-")
  let out
  if(split[0] === "stat") {
    out = build.stats[split[1]].icon
  }

  if(split[0] === "ability") {
    let socketIndex = split[2]

    build.items.subclass.abilities.forEach(el => {
      if(el.socketIndex === socketIndex) {
        out = el.iconUrl
      }
    })
  }

  if(split[0] === "aspect") {
    let socketIndex = split[2]

    build.items.subclass.aspects.forEach(el => {
      if(el.socketIndex === socketIndex) {
        out = el.iconUrl
      }
    })
  }

  if(split[0] === "fragment") {
    let socketIndex = split[2]

    build.items.subclass.fragments.forEach(el => {
      if(el.socketIndex === socketIndex) {
        out = el.iconUrl
      }
    })
  }

  if(split[0] === "perk") {
    let socketIndex = split[2]
    let item = getItemForInstanceId(build.items, split[1])

    if(item) {
      item.perks.forEach(el => {
        if(el.socketIndex === socketIndex) {
          out = el.iconUrl
        }
      })
    }
  }

  if(split[0] === "mod") {
    let socketIndex = split[2]
    let item = getItemForInstanceId(build.items, split[1])

    if(item) {
      item.mods.forEach(el => {
        if(el.socketIndex === socketIndex) {
          out = el.iconUrl
        }
      })
    }
  }

  if(split[0] === "subclass") {
    // TODO: Fix this when summary images are made
    if(split[1] !== "supertree") {
      out = build.items.subclass.superConfig[split[1]].iconUrl
    }
  }

  if(split[0] === "item") {
    let item = getItemForInstanceId(build.items, split[1])
    if(item) {
      out = item.iconUrl
    }
  }
  return out
}

function getItemForInstanceId(items, instanceId) {
  let retVal
  Object.keys(items).forEach(k => {
    if(items[k].itemInstanceId === instanceId) {
      retVal = items[k]
    }
  })
  return retVal
}

export default {
  convertToSummary: function(buildId, build) {
    let summary = {
      id: buildId,
      name: build.name,
      userId: build.selectedUser.bungieNetUserId,
      username: build.selectedUser.displayName,
      highlights: []
    }

    if(build.highlights && build.highlights.length > 0) {
      // parse highlights
      build.highlights.forEach(h => {
        if(summary.highlights.length < 3) {
          let icon = getHighlightIcon(build, h)
          summary.highlights.push(icon)
        }
      })
    } else {
      summary.highlights.push(build.items.kinetic.iconUrl)
      summary.highlights.push(build.items.energy.iconUrl)
      summary.highlights.push(build.items.power.iconUrl)
    }

    if(build.items.subclass.isLightSubclass) {
      let { damageType, tree } = build.items.subclass.superConfig
      summary.primaryIconSet = `${build.class}-${damageType}-${tree}`
    } else {
      summary.primaryIconSet = `${build.class}-6`
    }
    return summary
  },

  lookupCharacterStats(characterData, manifestService) {
    let stats = {}
    Object.keys(characterData.character.stats).forEach(key => {
      // $.DestinyStatDefinition.144602215.displayProperties.icon
      let def = manifestService.getItem("DestinyStatDefinition", key)
      if(def && def.displayProperties && def.displayProperties.name) {
        stats[def.displayProperties.name.toLowerCase()] = {
          icon: `https://www.bungie.net${def.displayProperties.icon}`,
          name: def.displayProperties.name,
          value: characterData.character.stats[key]
        }
      }
    })
    return stats
  },

  buildBucketLocationMap(data) {
    let bucketLocationMap = {}
    Object.keys(data).forEach(key => {
      if(data[key].displayProperties && data[key].displayProperties.name) {
        let name = data[key].displayProperties.name

        if(name === "Kinetic Weapons") {
          bucketLocationMap[key] = "kinetic"
        }

        if(name === "Energy Weapons") {
          bucketLocationMap[key] = "energy"
        }

        if(name === "Power Weapons") {
          bucketLocationMap[key] = "power"
        }

        if(name === "Helmet") {
          bucketLocationMap[key] = "helmet"
        }

        if(name === "Gauntlets") {
          bucketLocationMap[key] = "arms"
        }

        if(name === "Chest Armor") {
          bucketLocationMap[key] = "chest"
        }

        if(name === "Leg Armor") {
          bucketLocationMap[key] = "legs"
        }

        if(name === "Class Armor") {
          bucketLocationMap[key] = "classItem"
        }

        if(name === "Subclass") {
          bucketLocationMap[key] = "subclass"
        }
      }
    })
    return bucketLocationMap
  },

  getDataForItemInstance(manifestService, characterData, itemInstanceId, itemHash) {
    let itemData = {}

    let item = manifestService.getItem("DestinyInventoryItemDefinition", itemHash);
    if(item && item.sockets && item.sockets.socketEntries) {
      let socketDefs = []

      item.sockets.socketEntries.forEach(se => {
        let def = {}
        // $.DestinySocketTypeDefinition.2029743434.socketCategoryHash
        def.type = manifestService.getItem("DestinySocketTypeDefinition", se.socketTypeHash)
        // $.DestinySocketCategoryDefinition.760375309.hash
        if(def.type) {
          def.category = manifestService.getItem("DestinySocketCategoryDefinition", def.type.socketCategoryHash)
        }
        socketDefs.push(def)
      })
      itemData.socketDefs = socketDefs
    }

    itemData.item = item

    if(characterData && characterData.instances && characterData.instances[itemInstanceId] && characterData.instances[itemInstanceId].damageTypeHash) {
      itemData.damageType = manifestService.getItem("DestinyDamageTypeDefinition", characterData.instances[itemInstanceId].damageTypeHash)
    }

    if(characterData && characterData.talentGrids && characterData.talentGrids[itemInstanceId]) {
      itemData.talentGridDef = manifestService.getItem("DestinyTalentGridDefinition", characterData.talentGrids[itemInstanceId].talentGridHash)
    }

    if(characterData && characterData.sockets && characterData.sockets[itemInstanceId]) {
      let sockets = characterData.sockets[itemInstanceId].sockets
      sockets.forEach(s => {
        let def = manifestService.getItem("DestinyInventoryItemDefinition", s.plugHash)
        s.def = def
      })
      itemData.sockets = sockets
    }

    if(characterData && characterData.talentGrids) {
      itemData.talentGrid = characterData.talentGrids[itemInstanceId]
    }

    if(characterData && characterData.stats && characterData.stats[itemInstanceId]) {
      let stats = characterData.stats[itemInstanceId].stats
      Object.keys(stats).forEach(statHash => {
        let statDef = manifestService.getItem("DestinyStatDefinition", statHash)
        stats[statHash].def = statDef
      })
      itemData.stats = stats
    }

    if(characterData && characterData.reusablePlugs && characterData.reusablePlugs[itemInstanceId]) {
      itemData.reusablePlugs = characterData.reusablePlugs[itemInstanceId].plugs
    }

    if(characterData && characterData.instances && characterData.instances[itemInstanceId]) {
      itemData.instanceData = characterData.instances[itemInstanceId]
    }

    if(characterData && characterData.equipment) {
      let item = characterData.equipment.find(el => el.itemInstanceId === itemInstanceId)
      if(item && item.overrideStyleItemHash) {
        // $.DestinyInventoryItemDefinition.4029360764
        let ornamentItem = manifestService.getItem("DestinyInventoryItemDefinition", item.overrideStyleItemHash)
        if(ornamentItem && ornamentItem.displayProperties && ornamentItem.displayProperties.icon) {
          itemData.ornamentIconPath = ornamentItem.displayProperties.icon
        }
      }
    }
    if(item && item.itemTypeDisplayName && item.itemTypeDisplayName.includes("Subclass")) {
      // console.log(JSON.stringify(itemData))
    }
    return itemData
  },

  lookupItemInstances(characterData, manifestService, socketCategoryExclusions) {
    let bucketLocationMap = this.buildBucketLocationMap(manifestService.manifestData.get("DestinyInventoryBucketDefinition"))

    let items = {}
    let excludedSocketCateogies = []
    if(socketCategoryExclusions) {
      excludedSocketCateogies = socketCategoryExclusions
    }

    characterData.equipment.forEach(el => {
      let slot = bucketLocationMap[el.bucketHash]

      if(slot) {
        let item = {
          slot,
          mods: [],
          perks :[],
          abilities: [],
          aspects: [],
          fragments: [],
          super: [],
          itemInstanceId: el.itemInstanceId,
          itemHash: el.itemHash,
          ornamentIconUrl: null,
          name: null,
          iconUrl: null,
          affinityIcon: null
        }

        let itemDef = manifestService.getItem("DestinyInventoryItemDefinition", el.itemHash);
        if(itemDef) {
          item.iconUrl = `https://www.bungie.net${itemDef.displayProperties.icon}`
          item.name = itemDef.displayProperties.name
        }

        let itemData = this.getDataForItemInstance(manifestService, characterData, el.itemInstanceId, el.itemHash)
        if(itemData.ornamentIconPath) {
          item.ornamentIconUrl = `https://www.bungie.net${itemData.ornamentIconPath}`
        }

        if(itemData.damageType && itemData.damageType.displayProperties && itemData.damageType.displayProperties.icon) {
          item.affinityIcon = `https://www.bungie.net${itemData.damageType.displayProperties.icon}`
        }

        if(itemData.sockets) {
          itemData.sockets.forEach((s, idx) => {
            if(s.def && s.def.displayProperties && s.def.displayProperties.name && s.def.displayProperties.name.includes("Tracker")) {
              s.isHidden = true
            }

            if(itemData.socketDefs && itemData.socketDefs[idx] && itemData.socketDefs[idx].category && itemData.socketDefs[idx].category.displayProperties) {
              if(excludedSocketCateogies.find(esc => esc === itemData.socketDefs[idx].category.displayProperties.name)) {
                s.isHidden = true
              }

              if(itemData.socketDefs[idx].category.displayProperties.name === "ARMOR TIER") {
                item.affinityIcon = `https://www.bungie.net${s.def.displayProperties.icon}`
              }

              if(s.def &&
                s.def.displayProperties &&
                s.def.displayProperties.name &&
                s.def.displayProperties.name.includes("Empty") &&
                s.def.displayProperties.name.includes("Socket"))  {
                s.isEmpty = true
              }

              if(s.isVisible && !s.isHidden) {
                // Setup mods
                if(itemData.socketDefs[idx].category.displayProperties.name === "ARMOR MODS" ||
                  itemData.socketDefs[idx].category.displayProperties.name === "WEAPON MODS") {
                  item.mods.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    name: s.def.displayProperties.name,
                    itemInstanceId: el.itemInstanceId,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }

                if(itemData.socketDefs[idx].category.displayProperties.name === "ARMOR PERKS" ||
                  itemData.socketDefs[idx].category.displayProperties.name === "WEAPON PERKS") {
                  item.perks.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    name: s.def.displayProperties.name,
                    itemInstanceId: el.itemInstanceId,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }

                if(itemData.socketDefs[idx].category.displayProperties.name === "ABILITIES") {
                  item.abilities.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    name: s.def.displayProperties.name,
                    itemInstanceId: el.itemInstanceId,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }

                if(itemData.socketDefs[idx].category.displayProperties.name === "ASPECTS") {
                  item.aspects.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    name: s.def.displayProperties.name,
                    itemInstanceId: el.itemInstanceId,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }

                if(itemData.socketDefs[idx].category.displayProperties.name === "FRAGMENTS") {
                  item.fragments.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    name: s.def.displayProperties.name,
                    itemInstanceId: el.itemInstanceId,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }

                if(itemData.socketDefs[idx].category.displayProperties.name === "SUPER") {
                  item.super.push({
                    plugHash: s.plugHash,
                    iconUrl: `https://www.bungie.net${s.def.displayProperties.icon}`,
                    itemInstanceId: el.itemInstanceId,
                    name: s.def.displayProperties.name,
                    socketIndex: idx,
                    isEmpty: s.isEmpty
                  })
                }
              }
            }
          })
        }


        if(slot === "subclass") {
          let superConfig = {
            grenade: null,
            movement: null,
            specialty: null,
            tree: null,
            treeNodes: [],
            damageType: null,
            characterIconUrl: `https://www.bungie.net${itemData.item.secondaryIcon}`,
            bgUrl: `https://www.bungie.net${itemData.item.screenshot}`,
          }

          if(itemData.item && itemData.item.talentGrid) {
            // NOTE: could also use talentGrid.buildName ("void_warlock")
            // 1 - Kinetic, 2 - Arc, 3 - Solar, 4 - Void, 5 - Raid (reserved), 6 - Stasis
            superConfig.damageType = itemData.item.talentGrid.hudDamageType
            item.damageType = itemData.item.talentGrid.hudDamageType
          }

          let equipped = []
          if(itemData.talentGrid && itemData.talentGridDef) {
            itemData.talentGrid.nodes.forEach(el => {
              if(el.isActivated) {
                equipped.push(el.nodeIndex)
              }
            })
          }

          // Is light subclass
          if(equipped.length > 0) {
            let categoriesMap = {}
            let superNameMap = {}
            itemData.talentGridDef.nodeCategories.forEach(el => {
              if(el.nodeHashes) {
                el.nodeHashes.forEach(el2 => {
                  categoriesMap[el2] = el.identifier
                })
              }
              if(el.identifier === "FirstPath") {
                superNameMap[1] = el.displayProperties.name
              }
              if(el.identifier === "SecondPath") {
                superNameMap[2] = el.displayProperties.name
              }
              if(el.identifier === "ThirdPath") {
                superNameMap[3] = el.displayProperties.name
              }
            })

            equipped.forEach(el => {
              let nodeType = categoriesMap[el]
              if(nodeType && itemData.talentGridDef.nodes[el]) {
                let item = {
                  name: itemData.talentGridDef.nodes[el].steps[0].displayProperties.name,
                  iconUrl: `https://www.bungie.net${itemData.talentGridDef.nodes[el].steps[0].displayProperties.icon}`
                }

                if(nodeType === "Super") {
                  superConfig.super = item
                }

                if(nodeType === "ClassSpecialties") {
                  superConfig.specialty = item
                }

                if(nodeType === "MovementModes") {
                  superConfig.movement = item
                }

                if(nodeType === "Grenades") {
                  superConfig.grenade = item
                }

                if(nodeType === "FirstPath") {
                  superConfig.tree = 1
                  superConfig.treeTitle = superNameMap[1]
                  superConfig.treeNodes.push(item)
                }

                if(nodeType === "SecondPath") {
                  superConfig.tree = 2
                  superConfig.treeTitle = superNameMap[2]
                  superConfig.treeNodes.push(item)
                }

                if(nodeType === "ThirdPath") {
                  superConfig.tree = 3
                  superConfig.treeTitle = superNameMap[3]
                  superConfig.treeNodes.push(item)
                }
              }
            })
            item.isLightSubclass = true
            item.superConfig = superConfig
          }
        }

        items[slot] = item
      }
    })
    return items
  },

  lookupItemInstance(itemBase, instanceData, socketData, manifestService) {
    // TODO: Change this to use item type/subtype
    const itemInventoryBucketHashMap = {
      1498876634: "kinetic",
      2465295065: "energy",
      953998645: "power",
      3448274439: "helmet",
      3551918588: "arms",
      14239492: "chest",
      20886954: "legs",
      1585787867: "classItem",
    }

    const item = {
      _meta: {
        instance: itemBase,
      },
      perks: [],
      mods: [],
      other: []
    }

    // Basic Item Info
    let itemDef = manifestService.getItem("DestinyInventoryItemDefinition", itemBase.itemHash);
    if(itemDef) {
      item._meta.def = itemDef
    }

    if(itemDef && itemDef.inventory && itemDef.inventory.tierType === 6) {
      item.isExotic = true
    }
    if(itemDef && itemDef.displayProperties && itemDef.displayProperties.icon) {
      item.iconUrl = `https://www.bungie.net${itemDef.displayProperties.icon}`
      item.name = itemDef.displayProperties.name
      item.itemType = itemDef.itemType
      item.itemSubType = itemDef.itemSubType
      item.classType = itemDef.classType

      // Slot
      if(itemDef.inventory && itemDef.inventory.bucketTypeHash) {
        item.slot = itemInventoryBucketHashMap[itemDef.inventory.bucketTypeHash]
      }
    } else {
      return null
    }

    // Perks
    if(itemDef.sockets && itemDef.sockets.socketEntries) {
      itemDef.sockets.socketEntries.forEach((se, idx) => {
        let type = manifestService.getItem("DestinySocketTypeDefinition", se.socketTypeHash)
        if(type) {
          let category = manifestService.getItem("DestinySocketCategoryDefinition", type.socketCategoryHash)
          let { sockets } = socketData[itemBase.itemInstanceId]
          let socket = sockets[idx]
          let plugDef = manifestService.getItem("DestinyInventoryItemDefinition", socket.plugHash)
          if(plugDef && plugDef.displayProperties && plugDef.displayProperties.name && !plugDef.displayProperties.name.includes("Tracker")) {
            let popSocket = {
              iconUrl: `https://www.bungie.net${plugDef.displayProperties.icon}`,
              name: plugDef.displayProperties.name,
              def: plugDef
            }
            if(category?.displayProperties?.name?.includes("PERK")) {
              item.perks.push(popSocket)
            } else if(category?.displayProperties?.name?.includes("MOD")) {
              item.mods.push(popSocket)
            } else {
              item.other.push(popSocket)
            }
          }
        }
      })
    }

    // Item Instance Data
    if(itemBase.itemInstanceId && instanceData[itemBase.itemInstanceId]) {
      // Damage Type
      let damageType = manifestService.getItem("DestinyDamageTypeDefinition", instanceData[itemBase.itemInstanceId].damageTypeHash)
      if(damageType) {
        item.damageType = damageType
      }


      //
    }

    // TODO: Ornament

    // let itemData = manifestService.getDataForItemInstance(characterData, item.itemInstanceId, item.itemHash)
    // if(itemData.ornamentIconPath) {
    //   item.ornamentIconUrl = `https://www.bungie.net${itemData.ornamentIconPath}`
    // }

    // if(itemData.damageType && itemData.damageType.displayProperties && itemData.damageType.displayProperties.icon) {
    //   item.affinityIcon = `https://www.bungie.net${itemData.damageType.displayProperties.icon}`
    // }
    return item
  }
}
