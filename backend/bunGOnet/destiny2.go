package bunGOnet

import (
	"errors"
	"fmt"
)

func GetManifest() (DestinyManifest, error) {
	uri := "/Destiny2/Manifest"

	var data DestinyManifest
	_, err := callBungieNet("get", uri, &data)
	if err != nil {
		return DestinyManifest{}, err
	}

	return data, nil

}

func SearchDestinyPlayer(membershipType int, displayName string) ([]DestinyPlayer, error) {
	uri := fmt.Sprintf("/Destiny2/SearchDestinyPlayer/%v/%s", membershipType, displayName)

	var data []DestinyPlayer
	_, err := callBungieNet("get", uri, &data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func GetProfile(membershipType int, destinyMembershipId int, components []int) (GetProfileResponse, error) {
	if len(components) == 0 {
		return GetProfileResponse{}, errors.New("must pass in a slice of components")
	}

	componentsStr := parseComponentsString(components)

	uri := fmt.Sprintf("/Destiny2/%v/Profile/%v/?components=%v", membershipType, destinyMembershipId, componentsStr)

	var data GetProfileResponse
	callBungieNet("get", uri, &data)
	return data, nil
}

func GetCharacter(membershipType int,
	destinyMembershipId int,
	characterId int,
	components []int) (GetCharacterResponse, error) {
	if len(components) == 0 {
		return GetCharacterResponse{}, errors.New("must pass in a slice of components")
	}

	componentsStr := parseComponentsString(components)

	uri := fmt.Sprintf("/Destiny2/%v/Profile/%v/Character/%v?components=%v", membershipType, destinyMembershipId, characterId, componentsStr)

	var data GetCharacterResponse
	callBungieNet("get", uri, &data)
	return data, nil
}
