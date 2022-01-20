package models

type Profile struct {
	MembershipId          string `json:"membershipId"`
	DisplayName           string `json:"displayName"`
	PrimaryMembershipType string `json:"primaryMembershipType"`
	LinkedSystems         []int  `json:"linkedSystems"`
}

// type GetCharacterResponse struct {
// 	Character     bunGOnet.Character                `json:"character"`
// 	Equipment     []bunGOnet.EquipmentItem          `json:"equipment"`
// 	Instances     map[string]bunGOnet.Instance      `json:"instances"`
// 	Perks         map[string]bunGOnet.PerkWrapper   `json:"perks"`
// 	Stats         map[string]bunGOnet.StatWrapper   `json:"stats"`
// 	Sockets       map[string]bunGOnet.SocketWrapper `json:"sockets"`
// 	TalentGrids   map[string]bunGOnet.TalentGrid    `json:"talentGrids"`
// 	PlugStates    map[string]bunGOnet.PlugState     `json:"plugStates"`
// 	ReusablePlugs map[string]bunGOnet.PlugsData     `json:"reusablePlugs"`
// }

type AuthCodeRequest struct {
	Code string `json:"code"`
}

// type Character struct {
// 	CharacterId
// 	Light
// 	ClassType
// 	RaceType
// 	EmblemPath
// 	Stats
// 	Equipment
// }

// type Equipment struct {
// 	ItemHash
// 	InstanceId
// 	BucketHash
// }
