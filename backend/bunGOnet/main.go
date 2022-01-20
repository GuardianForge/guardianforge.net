package bunGOnet

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

var bungieNetBase string = "https://www.bungie.net/Platform"
var _apiKey string

func SetApiKey(apiKey string) {
	_apiKey = apiKey
}

func callBungieNet(method string, uri string, out interface{}) (bungieNetResponseMeta, error) {
	url := fmt.Sprintf("%s/%s", bungieNetBase, uri)

	req, err := http.NewRequest(strings.ToUpper(method), url, nil)
	check(err)

	req.Header.Set("X-API-Key", _apiKey)
	client := &http.Client{}
	resp, err := client.Do(req)
	check(err)

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	check(err)

	var responseObj bungieNetResponseWrapper

	json.Unmarshal(bodyBytes, &responseObj)
	json.Unmarshal(responseObj.Response, &out)

	return bungieNetResponseMeta{
		ErrorCode:       responseObj.ErrorCode,
		ThrottleSeconds: responseObj.ThrottleSeconds,
		ErrorStatus:     responseObj.ErrorStatus,
		Message:         responseObj.Message,
		MessageData:     responseObj.MessageData,
	}, nil
}

func callBungieNetWithAuth(method string, uri string, token string, out interface{}) (bungieNetResponseMeta, error) {
	url := fmt.Sprintf("%s/%s", bungieNetBase, uri)

	req, err := http.NewRequest(strings.ToUpper(method), url, nil)
	check(err)

	req.Header.Set("X-API-Key", _apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %v", token))
	client := &http.Client{}
	resp, err := client.Do(req)
	check(err)

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	check(err)

	var responseObj bungieNetResponseWrapper

	json.Unmarshal(bodyBytes, &responseObj)
	json.Unmarshal(responseObj.Response, &out)

	return bungieNetResponseMeta{
		ErrorCode:       responseObj.ErrorCode,
		ThrottleSeconds: responseObj.ThrottleSeconds,
		ErrorStatus:     responseObj.ErrorStatus,
		Message:         responseObj.Message,
		MessageData:     responseObj.MessageData,
	}, nil
}

func parseComponentsString(components []int) string {
	componentsStr := ""
	for _, el := range components {
		if componentsStr == "" {
			componentsStr = fmt.Sprintf("%v", el)
		} else {
			componentsStr = fmt.Sprintf("%v,%v", componentsStr, el)
		}
	}
	return componentsStr
}
