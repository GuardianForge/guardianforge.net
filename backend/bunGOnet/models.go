package bunGOnet

import "encoding/json"

type BungieNetUser struct {
	MembershipId string `json:"membershipId"`
}

type DestinyPlayer struct {
	IconPath       string `json:"iconPath"`
	MembershipType int    `json:"membershipType"`
	MembershipId   string `json:"membershipId"`
	DisplayName    string `json:"displayName"`
}

type GetProfileResponse struct {
	Characters         CharactersMap      `json:"characters"`
	CharacterEquipment CharacterEquipment `json:"characterEquipment"`
	CharacterPlugSets  PlugSets           `json:"characterPlugSets"`
	ItemComponents     ItemComponents     `json:"itemComponents"`
}

type GetCharacterResponse struct {
	Character      CharacterDataWrapper `json:"character"`
	Equipment      Equipment            `json:"equipment"`
	PlugSets       PlugSets             `json:"plugSets"`
	ItemComponents ItemComponents       `json:"itemComponents"`
}

type CharacterDataWrapper struct {
	Data Character `json:"data"`
}

type ItemComponents struct {
	Instances     Instances     `json:"instances"`
	Perks         Perks         `json:"perks"`
	Stats         Stats         `json:"stats"`
	Sockets       Sockets       `json:"sockets"`
	TalentGrids   TalentGrids   `json:"talentGrids"`
	PlugStates    PlugStates    `json:"plugStates"`
	ReusablePlugs ReusablePlugs `json:"reusablePlugs"`
}

type ReusablePlugs struct {
	Data map[string]PlugsData `json:"data"`
}

type PlugsData struct {
	Plugs map[int][]Plug `json:"plugs"`
}

type PlugStates struct {
	Data map[string]PlugState `json:"data"`
}

type PlugState struct {
	PlugItemHash      int64 `json:"plugItemHash"`
	CanInsert         bool  `json:"canInsert"`
	Enabled           bool  `json:"enabled"`
	InsertFailIndexes []int `json:"insertFailIndexes"`
}

type TalentGrids struct {
	Data map[string]TalentGrid `json:"data"`
}

type TalentGrid struct {
	TalentGridHash int64                `json:"talentGridHash"`
	Nodes          []TalentGridHashNode `json:"nodes"`
	IsGridComplete bool                 `json:"isGridComplete"`
}

type TalentGridHashNode struct {
	NodeIndex           int     `json:"nodeIndex"`
	NodeHash            int     `json:"nodeHash"`
	State               int     `json:"state"`
	IsActivated         bool    `json:"isActivated"`
	StepIndex           int     `json:"stepIndex"`
	ActivationGridLevel int     `json:"activationGridLevel"`
	ProgressPercent     float32 `json:"progressPercent"`
	Hidden              bool    `json:"hidden"`
	// TODO: MaterialsToUpgrade
}

type Sockets struct {
	Data map[string]SocketWrapper `json:"data"`
}

type SocketWrapper struct {
	Sockets []Socket `json:"sockets"`
}

type Socket struct {
	PlugHash  int64 `json:"plugHash"`
	IsEnabled bool  `json:"isEnabled"`
	IsVisible bool  `json:"isVisible"`
}

type Stats struct {
	Data map[string]StatWrapper `json:"data"`
}

type StatWrapper struct {
	Stats map[string]Stat `json:"stats"`
}

type Stat struct {
	StatHash int64 `json:"statHash"`
	Value    int   `json:"value"`
}

type Instances struct {
	Data map[string]Instance `json:"data"`
}

type Instance struct {
	DamageTypeHash int64 `json:"damageTypeHash"`
}

type Perks struct {
	Data map[string]PerkWrapper `json:"data"`
}

type PerkWrapper struct {
	Perks []Perk `json:"perks"`
}

type Perk struct {
	PerkHash int64  `json:"perkHash"`
	IconPath string `json:"iconPath"`
	IsActive bool   `json:"isActive"`
	Visible  bool   `json:"visible"`
}

type CharacterEquipment struct {
	Data map[string]CharacterEquipmentItemMap `json:"data"`
}

type CharacterEquipmentItemMap struct {
	Items []CharacterEquipmentItem `json:"items"`
}

type CharacterEquipmentItem struct {
	ItemHash int64 `json:"itemHash"`
}

type PlugSets struct {
	Data map[string]PlugData `json:"data"`
}

type PlugData struct {
	Plugs map[string][]Plug `json:"plugs"`
}

// type PlugMap struct {
// 	PlugSet map[string]Plug `json:"`
// }

type Plug struct {
	PlugItemHash int64 `json:"plugItemHash"`
	CanInsert    bool  `json:"canInsert"`
	Enabled      bool  `json:"enabled"`
}

type CharactersMap struct {
	CharactersData map[string]Character `json:"data"`
}

func (cs *CharactersMap) ToCharactersSlice() []Character {

	var characters []Character
	for _, element := range cs.CharactersData {
		characters = append(characters, element)
	}

	return characters
}

type Character struct {
	CharacterId          string         `json:"characterId"`
	Light                int            `json:"light"`
	ClassType            int            `json:"classType"`
	RaceType             int            `json:"raceType"`
	EmblemPath           string         `json:"emblemPath"`
	EmplemBackgroundPath string         `json:"emblemBackgroundPath"`
	Equipment            Equipment      `json:"equipment"`
	Stats                map[string]int `json:"stats"`
}

type Equipment struct {
	Data EquipmentData `json:"data"`
}

type EquipmentData struct {
	Items []EquipmentItem `json:"items"`
}

type EquipmentItem struct {
	ItemHash              uint32 `json:"itemHash"`
	ItemInstanceId        string `json:"itemInstanceId"`
	BucketHash            uint32 `json:"bucketHash"`
	OverrideStyleItemHash uint32 `json:"overrideStyleItemHash"`
}

type bungieNetResponseWrapper struct {
	Response        json.RawMessage `json:"Response"`
	ErrorCode       int             `json:"ErrorCode"`
	ThrottleSeconds int             `json:"ThrottleSeconds"`
	ErrorStatus     string          `json:"ErrorStatus"`
	Message         string          `json:"Message"`
	MessageData     interface{}     `json:"MessageData"`
}

type bungieNetResponseMeta struct {
	ErrorCode       int         `json:"ErrorCode"`
	ThrottleSeconds int         `json:"ThrottleSeconds"`
	ErrorStatus     string      `json:"ErrorStatus"`
	Message         string      `json:"Message"`
	MessageData     interface{} `json:"MessageData"`
}

type DestinyManifest struct {
	Version                        string                              `json:"version"`
	JsonWorldContentPaths          map[string]string                   `json:"jsonWorldContentPaths"`
	JsonWorldComponentContentPaths map[string]WorldComponentDefinition `json:"jsonWorldComponentContentPaths"`
}

type WorldComponentDefinition struct {
	DestinyNodeStepSummaryDefinition                string `json:"DestinyNodeStepSummaryDefinition"`
	DestinyArtDyeChannelDefinition                  string `json:"DestinyArtDyeChannelDefinition"`
	DestinyArtDyeReferenceDefinition                string `json:"DestinyArtDyeReferenceDefinition"`
	DestinyPlaceDefinition                          string `json:"DestinyPlaceDefinition"`
	DestinyActivityDefinition                       string `json:"DestinyActivityDefinition"`
	DestinyActivityTypeDefinition                   string `json:"DestinyActivityTypeDefinition"`
	DestinyClassDefinition                          string `json:"DestinyClassDefinition"`
	DestinyGenderDefinition                         string `json:"DestinyGenderDefinition"`
	DestinyInventoryBucketDefinition                string `json:"DestinyInventoryBucketDefinition"`
	DestinyRaceDefinition                           string `json:"DestinyRaceDefinition"`
	DestinyTalentGridDefinition                     string `json:"DestinyTalentGridDefinition"`
	DestinyUnlockDefinition                         string `json:"DestinyUnlockDefinition"`
	DestinyMaterialRequirementSetDefinition         string `json:"DestinyMaterialRequirementSetDefinition"`
	DestinySandboxPerkDefinition                    string `json:"DestinySandboxPerkDefinition"`
	DestinyStatGroupDefinition                      string `json:"DestinyStatGroupDefinition"`
	DestinyProgressionMappingDefinition             string `json:"DestinyProgressionMappingDefinition"`
	DestinyFactionDefinition                        string `json:"DestinyFactionDefinition"`
	DestinyVendorGroupDefinition                    string `json:"DestinyVendorGroupDefinition"`
	DestinyRewardSourceDefinition                   string `json:"DestinyRewardSourceDefinition"`
	DestinyUnlockValueDefinition                    string `json:"DestinyUnlockValueDefinition"`
	DestinyRewardMappingDefinition                  string `json:"DestinyRewardMappingDefinition"`
	DestinyRewardSheetDefinition                    string `json:"DestinyRewardSheetDefinition"`
	DestinyItemCategoryDefinition                   string `json:"DestinyItemCategoryDefinition"`
	DestinyDamageTypeDefinition                     string `json:"DestinyDamageTypeDefinition"`
	DestinyActivityModeDefinition                   string `json:"DestinyActivityModeDefinition"`
	DestinyMedalTierDefinition                      string `json:"DestinyMedalTierDefinition"`
	DestinyAchievementDefinition                    string `json:"DestinyAchievementDefinition"`
	DestinyActivityGraphDefinition                  string `json:"DestinyActivityGraphDefinition"`
	DestinyActivityInteractableDefinition           string `json:"DestinyActivityInteractableDefinition"`
	DestinyBondDefinition                           string `json:"DestinyBondDefinition"`
	DestinyCharacterCustomizationCategoryDefinition string `json:"DestinyCharacterCustomizationCategoryDefinition"`
	DestinyCharacterCustomizationOptionDefinition   string `json:"DestinyCharacterCustomizationOptionDefinition"`
	DestinyCollectibleDefinition                    string `json:"DestinyCollectibleDefinition"`
	DestinyDestinationDefinition                    string `json:"DestinyDestinationDefinition"`
	DestinyEntitlementOfferDefinition               string `json:"DestinyEntitlementOfferDefinition"`
	DestinyEquipmentSlotDefinition                  string `json:"DestinyEquipmentSlotDefinition"`
	DestinyStatDefinition                           string `json:"DestinyStatDefinition"`
	DestinyInventoryItemDefinition                  string `json:"DestinyInventoryItemDefinition"`
	DestinyInventoryItemLiteDefinition              string `json:"DestinyInventoryItemLiteDefinition"`
	DestinyItemTierTypeDefinition                   string `json:"DestinyItemTierTypeDefinition"`
	DestinyLocationDefinition                       string `json:"DestinyLocationDefinition"`
	DestinyLoreDefinition                           string `json:"DestinyLoreDefinition"`
	DestinyMetricDefinition                         string `json:"DestinyMetricDefinition"`
	DestinyObjectiveDefinition                      string `json:"DestinyObjectiveDefinition"`
	DestinyPlatformBucketMappingDefinition          string `json:"DestinyPlatformBucketMappingDefinition"`
	DestinyPlugSetDefinition                        string `json:"DestinyPlugSetDefinition"`
	DestinyPowerCapDefinition                       string `json:"DestinyPowerCapDefinition"`
	DestinyPresentationNodeDefinition               string `json:"DestinyPresentationNodeDefinition"`
	DestinyProgressionDefinition                    string `json:"DestinyProgressionDefinition"`
	DestinyProgressionLevelRequirementDefinition    string `json:"DestinyProgressionLevelRequirementDefinition"`
	DestinyRecordDefinition                         string `json:"DestinyRecordDefinition"`
	DestinyRewardAdjusterPointerDefinition          string `json:"DestinyRewardAdjusterPointerDefinition"`
	DestinyRewardAdjusterProgressionMapDefinition   string `json:"DestinyRewardAdjusterProgressionMapDefinition"`
	DestinyRewardItemListDefinition                 string `json:"DestinyRewardItemListDefinition"`
	DestinySackRewardItemListDefinition             string `json:"DestinySackRewardItemListDefinition"`
	DestinySandboxPatternDefinition                 string `json:"DestinySandboxPatternDefinition"`
	DestinySeasonDefinition                         string `json:"DestinySeasonDefinition"`
	DestinySeasonPassDefinition                     string `json:"DestinySeasonPassDefinition"`
	DestinySocketCategoryDefinition                 string `json:"DestinySocketCategoryDefinition"`
	DestinySocketTypeDefinition                     string `json:"DestinySocketTypeDefinition"`
	DestinyTraitDefinition                          string `json:"DestinyTraitDefinition"`
	DestinyTraitCategoryDefinition                  string `json:"DestinyTraitCategoryDefinition"`
	DestinyUnlockCountMappingDefinition             string `json:"DestinyUnlockCountMappingDefinition"`
	DestinyUnlockEventDefinition                    string `json:"DestinyUnlockEventDefinition"`
	DestinyUnlockExpressionMappingDefinition        string `json:"DestinyUnlockExpressionMappingDefinition"`
	DestinyVendorDefinition                         string `json:"DestinyVendorDefinition"`
	DestinyMilestoneDefinition                      string `json:"DestinyMilestoneDefinition"`
	DestinyActivityModifierDefinition               string `json:"DestinyActivityModifierDefinition"`
	DestinyReportReasonCategoryDefinition           string `json:"DestinyReportReasonCategoryDefinition"`
	DestinyArtifactDefinition                       string `json:"DestinyArtifactDefinition"`
	DestinyBreakerTypeDefinition                    string `json:"DestinyBreakerTypeDefinition"`
	DestinyChecklistDefinition                      string `json:"DestinyChecklistDefinition"`
	DestinyEnergyTypeDefinition                     string `json:"DestinyEnergyTypeDefinition"`
}
