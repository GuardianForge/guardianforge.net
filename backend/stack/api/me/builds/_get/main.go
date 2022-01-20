package main

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) validating request")
	}

	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	bookmarks, err := services.FetchUserBuilds(*membershipId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) FetchUserBuilds")
	}

	jsonBytes, err := json.Marshal(bookmarks)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal bookmarks")
	}

	body := string(jsonBytes)
	return utils.OkResponse(&body)
}
