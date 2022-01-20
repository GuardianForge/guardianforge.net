package main

import (
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws/session"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Authorize user
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Validating auth")
	}
	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	buildId := request.PathParameters["buildId"]

	// Fetch from Dynamo, confirm userId matches
	record, err := services.FetchBuildById(buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) FetchBuildsById")
	}
	if record.CreatedById != *membershipId {
		return utils.UnauthorizedResponse(nil)
	}

	// Delete from Dynamo
	sess, err := session.NewSession()
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Creating AWS session to delete  Dynamo record")
	}
	err = services.DeleteBuildFromDynamo(sess, buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Deleting build from Dynami")
	}

	workspace := os.Getenv("ALGOLIA_WORKSPACE")
	key := os.Getenv("ALGOLIA_KEY")
	indexName := os.Getenv("ALGOLIA_INDEX")
	err = services.DeleteItemFromAlgolia(workspace, key, indexName, buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Delete from Algolia")
	}

	return utils.OkResponse(nil)
}
