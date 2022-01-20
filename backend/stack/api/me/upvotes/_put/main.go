package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	userId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) validating request")
	}
	if userId == nil {
		return utils.UnauthorizedResponse(nil)
	}
	var summary dbModels.BuildSummary
	err = json.Unmarshal([]byte(request.Body), &summary)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) json.Unmarshal")
	}

	isDecrementing := false

	// Update users upvotes
	dbUpvotes, err := services.FetchUserUpvotes(*userId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) fetch user upvotes")
	}

	upvotes := map[string]dbModels.BuildSummary{}

	if dbUpvotes != nil && len(*dbUpvotes) > 0 {
		upvotes = *dbUpvotes
	}

	if _, ok := upvotes[*summary.BuildId]; ok {
		delete(upvotes, *summary.BuildId)
		isDecrementing = true
	} else {
		upvotes[*summary.BuildId] = summary
	}

	err = services.PutUserUpvotesToDynamo(*userId, upvotes)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) put user upvotes to dynamo")
	}

	// Update upvotes in Dynamo
	err = services.UpdateBuildUpvoteCount(*summary.BuildId, isDecrementing)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) update build upvote count")
	}

	// Send to post build upvote handler
	sqsModel := models.UpvoteBuildsSqsModel{
		BuildId:        *summary.BuildId,
		IsDecrementing: isDecrementing,
	}
	queueUrl := os.Getenv("UPVOTE_BUILDS_QUEUE")
	err = services.PostToSqs(queueUrl, sqsModel)
	if err != nil {
		log.Println(fmt.Sprintf("(handler) failed to post to upvotes sqs: %v", err))
	}

	upvoteBytes, err := json.Marshal(upvotes)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal upvote bytes to json")
	}
	bodyStr := string(upvoteBytes)
	return utils.OkResponse(&bodyStr)
}
