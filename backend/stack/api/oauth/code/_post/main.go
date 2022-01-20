package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/pkg/errors"
)

type AuthCodeRequest struct {
	Code string `json:"code"`
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	clientId := os.Getenv("OAUTH_CLIENT_ID")
	clientSecret := os.Getenv("OAUTH_CLIENT_SECRET")

	log.Println("clientId", clientId)
	log.Println("clientSecret", clientSecret)

	response := events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
	}

	var authCodeRequest AuthCodeRequest
	err := json.Unmarshal([]byte(request.Body), &authCodeRequest)
	if err != nil {
		response.StatusCode = 500
		return response, errors.Wrap(err, "(handler) unmarshal body")
	}

	uri := "https://www.bungie.net/Platform/app/oauth/token/"
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", clientId)
	data.Set("client_secret", clientSecret)
	data.Set("code", authCodeRequest.Code)
	encodedData := data.Encode()
	bungieReq, err := http.NewRequest("POST", uri, strings.NewReader(encodedData))
	if err != nil {
		log.Println(err)
	}

	bungieReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	client := &http.Client{}
	res, err := client.Do(bungieReq)
	if err != nil {
		log.Println(err)
	}

	resBody, _ := ioutil.ReadAll(res.Body)

	response.Body = string(resBody)
	response.StatusCode = 200
	return response, nil
}

func main() {
	lambda.Start(handler)
}
