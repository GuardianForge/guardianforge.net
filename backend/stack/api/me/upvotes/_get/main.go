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

	upvotes, err := services.FetchUserUpvotes(*membershipId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) FetchUserUpvotes")
	}

	jsonBytes, err := json.Marshal(upvotes)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal upvotes")
	}

	strBody := string(jsonBytes)
	return utils.OkResponse(&strBody)
}
