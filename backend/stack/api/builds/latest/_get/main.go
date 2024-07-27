package main

import (
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Println(request.HTTPMethod, request.Path)

	builds, err := services.FetchLatestBuilds()
	if err != nil {
		return utils.ErrorResponse(err, "(handler) fetch latest builds")
	}

	jbytes, err := json.Marshal(builds)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal json")
	}

	strBody := string(jbytes)

	return utils.OkResponse(&strBody)
}
