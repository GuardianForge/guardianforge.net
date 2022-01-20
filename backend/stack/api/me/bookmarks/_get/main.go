package main

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/pkg/errors"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.HandleError(err, "(handler) validating request")
	}

	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	if err != nil {
		return events.APIGatewayProxyResponse{}, errors.Wrap(err, "(handler) make context")
	}

	bookmarks, err := services.FetchUserBookmarks(*membershipId)
	if err != nil {
		return events.APIGatewayProxyResponse{}, errors.Wrap(err, "(handler) fetchFromDynamo")
	}

	jsonBytes, err := json.Marshal(bookmarks)
	if err != nil {
		return events.APIGatewayProxyResponse{}, errors.Wrap(err, "(handler) marshal bookmarks")
	}

	strBody := string(jsonBytes)
	return utils.OkResponse(&strBody)
}
