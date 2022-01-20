package bunGOnet

import (
	"fmt"
)

type GetMembershipsForCurrentUserResponse struct {
	BungieNetUser BungieNetUser `json:"bungieNetUser"`
}

func SearchUsers(query string) ([]BungieNetUser, error) {
	uri := fmt.Sprintf("/User/SearchUsers/?q=%s", query)

	var data []BungieNetUser
	_, err := callBungieNet("get", uri, &data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func GetMembershipsForCurrentUser(token string) (GetMembershipsForCurrentUserResponse, error) {
	var data GetMembershipsForCurrentUserResponse
	_, err := callBungieNetWithAuth("get", "/User/GetMembershipsForCurrentUser/", token, &data)
	if err != nil {
		return GetMembershipsForCurrentUserResponse{}, err
	}

	return data, nil
}
