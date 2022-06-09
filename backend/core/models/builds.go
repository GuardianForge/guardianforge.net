package models

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	dbModels "guardianforge.net/core/db/models"
)

type Build struct {
	Highlights      []string        `json:"highlights"`
	Name            string          `json:"name"`
	Notes           string          `json:"notes"`
	Items           Items           `json:"items"`
	Class           int             `json:"class"`
	SelectedUser    BuildUser       `json:"selectedUser"`
	CreatedBy       string          `json:"createdBy"`
	Stats           StatsCollection `json:"stats"`
	PrimaryActivity string          `json:"primaryActivity"`
	VideoLink       string          `json:"videoLink"`
	IsPrivate       bool            `json:"isPrivate"`
	InputStyle      string          `json:"inputStyle"`
}

func (b *Build) ToDbRecord(buildId string, publishedOn int64, membershipId *string) dbModels.Build {
	createdById := "0"
	if membershipId != nil {
		createdById = *membershipId
	}

	var subclassCode string

	build := dbModels.Build{
		Id:          buildId,
		PublishedOn: publishedOn,
		CreatedById: createdById,
		IsPrivate:   false,
		Summary: dbModels.BuildSummary{
			UserId:   b.SelectedUser.BungieNetUserId,
			Username: b.SelectedUser.DisplayName,
			Name:     b.Name,
		},
	}

	// TODO: Make this more desciptive, no longer true after Void 3
	if b.Items.Subclass.IsLightSubclass {
		build.Summary.PrimaryIconSet = fmt.Sprintf("%v-%v-%v", b.Class, b.Items.Subclass.SuperConfig.DamageType, b.Items.Subclass.SuperConfig.Tree)
		subclassCode = strconv.Itoa(b.Items.Subclass.SuperConfig.DamageType)
	} else {
		if b.Items.Subclass.DamageType != nil {
			build.Summary.PrimaryIconSet = fmt.Sprintf("%v-%v", b.Class, *b.Items.Subclass.DamageType)
			subclassCode = fmt.Sprintf("%v", *b.Items.Subclass.DamageType)
		} else {
			build.Summary.PrimaryIconSet = fmt.Sprintf("%v-6", b.Class)
			subclassCode = "6"
		}
	}

	build.SearchKey = fmt.Sprintf("%v_%v", b.Class, subclassCode)
	if b.PrimaryActivity != "" {
		build.SearchKey += "_" + b.PrimaryActivity
	}

	if len(b.Highlights) > 0 {
		for _, h := range b.Highlights {
			url, err := b.GetHighlightIconUrl(h)
			if err != nil {
				log.Printf("Failed to get highlight %v: %v", h, err)
			}
			if url != "" {
				build.Summary.Highlights = append(build.Summary.Highlights, url)
			}
			if len(build.Summary.Highlights) > 3 {
				break
			}
		}
	} else {
		build.Summary.Highlights = append(build.Summary.Highlights, b.Items.Kinetic.IconURL)
		build.Summary.Highlights = append(build.Summary.Highlights, b.Items.Energy.IconURL)
		build.Summary.Highlights = append(build.Summary.Highlights, b.Items.Power.IconURL)
	}

	return build
}

func (b *Build) GetHighlightIconUrl(highlightStr string) (string, error) {
	split := strings.Split(highlightStr, "-")

	if split[0] == "stat" {
		if split[1] == "discipline" {
			return b.Stats.Discipline.IconUrl, nil
		}
		if split[1] == "intellect" {
			return b.Stats.Intellect.IconUrl, nil
		}
		if split[1] == "recovery" {
			return b.Stats.Recovery.IconUrl, nil
		}
		if split[1] == "strength" {
			return b.Stats.Strength.IconUrl, nil
		}
		if split[1] == "mobility" {
			return b.Stats.Mobility.IconUrl, nil
		}
		if split[1] == "resilience" {
			return b.Stats.Resilience.IconUrl, nil
		}
	}

	if split[0] == "ability" {
		socketIndex, err := strconv.Atoi(split[2])
		if err != nil {
			return "", err
		}

		for _, el := range b.Items.Subclass.Abilities {
			if el.SocketIndex == socketIndex {
				return el.IconURL, nil
			}
		}
	}

	if split[0] == "aspect" {
		socketIndex, err := strconv.Atoi(split[2])
		if err != nil {
			return "", err
		}

		for _, el := range b.Items.Subclass.Aspects {
			if el.SocketIndex == socketIndex {
				return el.IconURL, nil
			}
		}
	}

	if split[0] == "fragment" {
		socketIndex, err := strconv.Atoi(split[2])
		if err != nil {
			return "", err
		}

		for _, el := range b.Items.Subclass.Fragments {
			if el.SocketIndex == socketIndex {
				return el.IconURL, nil
			}
		}
	}

	if split[0] == "perk" {
		socketIndex, err := strconv.Atoi(split[2])
		if err != nil {
			return "", err
		}

		// get item
		item := getItemForInstanceId(b.Items, split[1])

		if item != nil {
			for _, el := range item.Perks {
				if el.SocketIndex == socketIndex {
					return el.IconURL, nil
				}
			}
		}
	}

	if split[0] == "mod" {
		socketIndex, err := strconv.Atoi(split[2])
		if err != nil {
			return "", err
		}

		// get item
		item := getItemForInstanceId(b.Items, split[1])

		if item != nil {
			for _, el := range item.Mods {
				if el.SocketIndex == socketIndex {
					return el.IconURL, nil
				}
			}
		}
	}

	if split[0] == "subclass" {
		if split[1] == "grenade" {
			return b.Items.Subclass.SuperConfig.Grenade.IconURL, nil
		}
		if split[1] == "movement" {
			return b.Items.Subclass.SuperConfig.Movement.IconURL, nil
		}
		if split[1] == "specialty" {
			return b.Items.Subclass.SuperConfig.Specialty.IconURL, nil
		}
	}

	if split[0] == "item" {
		item := getItemForInstanceId(b.Items, split[1])
		return item.IconURL, nil
	}

	return "", nil
}

func getItemForInstanceId(items Items, instanceId string) *BuildItem {
	if items.Kinetic.ItemInstanceID == instanceId {
		return &items.Kinetic
	}
	if items.Energy.ItemInstanceID == instanceId {
		return &items.Energy
	}
	if items.Power.ItemInstanceID == instanceId {
		return &items.Power
	}
	if items.Helmet.ItemInstanceID == instanceId {
		return &items.Helmet
	}
	if items.Arms.ItemInstanceID == instanceId {
		return &items.Arms
	}
	if items.Chest.ItemInstanceID == instanceId {
		return &items.Chest
	}
	if items.Legs.ItemInstanceID == instanceId {
		return &items.Legs
	}
	if items.ClassItem.ItemInstanceID == instanceId {
		return &items.ClassItem
	}
	return nil
}

func (b *Build) ToAlgoliaRecord(buildId string, dbRecord dbModels.Build) AlgoliaBuildRecord {
	dbRecord.Summary.BuildId = &buildId

	// TODO: Input Style
	algoliaBuild := AlgoliaBuildRecord{
		ObjectID:        buildId,
		Name:            b.Name,
		Notes:           b.Notes,
		Class:           b.Class,
		PrimaryActivity: b.PrimaryActivity,
		Summary:         dbRecord.Summary,
	}

	splitSearchKey := strings.Split(dbRecord.SearchKey, "_")
	subclassCode := splitSearchKey[1]

	splitSubclass := strings.Split(subclassCode, "_")
	subclassInt, err := strconv.Atoi(splitSubclass[0])
	if err == nil {
		algoliaBuild.Subclass = subclassInt
	}

	algoliaBuild.PlayerDetails += b.SelectedUser.BungieNetUserId + "|"
	algoliaBuild.PlayerDetails += b.SelectedUser.DisplayName

	// TODO: Extend to mods, perks, masterwork, etc
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Kinetic.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Energy.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Power.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Helmet.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Arms.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Chest.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.Legs.ItemHash)
	algoliaBuild.ItemHashes = append(algoliaBuild.ItemHashes, b.Items.ClassItem.ItemHash)

	algoliaBuild.ItemNames += b.Items.Kinetic.Name + "|"
	algoliaBuild.ItemNames += b.Items.Energy.Name + "|"
	algoliaBuild.ItemNames += b.Items.Power.Name + "|"
	algoliaBuild.ItemNames += b.Items.Helmet.Name + "|"
	algoliaBuild.ItemNames += b.Items.Arms.Name + "|"
	algoliaBuild.ItemNames += b.Items.Chest.Name + "|"
	algoliaBuild.ItemNames += b.Items.Legs.Name + "|"
	algoliaBuild.ItemNames += b.Items.ClassItem.Name + "|"

	return algoliaBuild
}

func (b *Build) ToDiscordEmbed(buildId string, subclassCode string, dataBucketName string, publicPath string) DiscordEmbed {
	embed := DiscordEmbed{
		Title:       &b.Name,
		Description: &b.Notes,
		Fields:      []EmbedField{},
	}

	if dataBucketName != "" {
		ogImageUrl := fmt.Sprintf("https://%v.s3.amazonaws.com/og/%v.png", dataBucketName, buildId)
		image := EmbedImage{
			Url: ogImageUrl,
		}
		embed.Image = &image
	}

	if publicPath != "" {
		buildUrl := fmt.Sprintf("%v/build/%v", publicPath, buildId)
		embed.Url = &buildUrl
	}

	classField := EmbedField{
		Name:   "Class",
		Inline: true,
		Value:  "Unknown",
	}
	if b.Class == 0 {
		classField.Value = "Titan"
	} else if b.Class == 1 {
		classField.Value = "Hunter"
	} else if b.Class == 2 {
		classField.Value = "Warlock"
	}
	embed.Fields = append(embed.Fields, classField)

	if subclassCode != "" {
		subclassField := EmbedField{
			Name:   "Subclass",
			Inline: true,
			Value:  "Unknown",
		}

		if subclassCode == "2" {
			subclassField.Value = "Arc"
		} else if subclassCode == "3" {
			subclassField.Value = "Solar"
		} else if subclassCode == "4" {
			subclassField.Value = "Void"
		} else if subclassCode == "6" {
			subclassField.Value = "Stasis"
		}
		embed.Fields = append(embed.Fields, subclassField)
	}

	return embed
}

type StatsCollection struct {
	Discipline Stat `json:"discipline"`
	Intellect  Stat `json:"intellect"`
	Mobility   Stat `json:"mobility"`
	Strength   Stat `json:"strength"`
	Resilience Stat `json:"resilience"`
	Recovery   Stat `json:"recovery"`
	Power      Stat `json:"power"`
}

type Stat struct {
	IconUrl string `json:"icon"`
	Name    string `json:"name"`
	Value   int    `json:"value"`
}

type BuildUser struct {
	BungieNetUserId string `json:"bungieNetUserId"`
	DisplayName     string `json:"displayName"`
	PlatformId      string `json:"platformId"`
}

type PlugItem struct {
	PlugHash       int64  `json:"plugHash"`
	IconURL        string `json:"iconUrl"`
	ItemInstanceID string `json:"itemInstanceId"`
	SocketIndex    int    `json:"socketIndex"`
	Name           string `json:"name"`
	IsEmpty        bool   `json:"isEmpty"`
}

type BuildItem struct {
	Slot            string      `json:"slot"`
	Mods            []PlugItem  `json:"mods"`
	Perks           []PlugItem  `json:"perks"`
	ItemInstanceID  string      `json:"itemInstanceId"`
	ItemHash        int         `json:"itemHash"`
	OrnamentIconURL string      `json:"ornamentIconUrl"`
	Name            string      `json:"name"`
	IconURL         string      `json:"iconUrl"`
	AffinityIcon    string      `json:"affinityIcon"`
	Abilities       []PlugItem  `json:"abilities"`
	Aspects         []PlugItem  `json:"aspects"`
	Fragments       []PlugItem  `json:"fragments"`
	Super           []PlugItem  `json:"super"`
	SuperConfig     SuperConfig `json:"superConfig"`
	IsLightSubclass bool        `json:"isLightSubclass"`
	DamageType      *int        `json:"damageType,omitempty"`
}

type SuperConfig struct {
	BackgroundUrl    string            `json:"bgUrl"`
	CharacterIconUrl string            `json:"characterIconUrl"`
	Grenade          SuperConfigItem   `json:"grenade"`
	Movement         SuperConfigItem   `json:"movement"`
	Specialty        SuperConfigItem   `json:"specialty"`
	Super            SuperConfigItem   `json:"super"`
	DamageType       int               `json:"damageType"`
	Tree             int               `json:"tree"`
	TreeNodes        []SuperConfigItem `json:"treeNodes"`
	TreeTitle        string            `json:"treeTitle"`
}

type SuperConfigItem struct {
	IconURL string `json:"iconUrl"`
	Name    string `json:"name"`
}

type Items struct {
	Kinetic   BuildItem `json:"kinetic"`
	Energy    BuildItem `json:"energy"`
	Power     BuildItem `json:"power"`
	Helmet    BuildItem `json:"helmet"`
	Arms      BuildItem `json:"arms"`
	Chest     BuildItem `json:"chest"`
	Legs      BuildItem `json:"legs"`
	ClassItem BuildItem `json:"classItem"`
	Subclass  BuildItem `json:"subclass"`
}
