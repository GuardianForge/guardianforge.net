package main

import (
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws/session"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

type UpdateBuildRequest struct {
	Name            *string `json:"name"`
	Notes           *string `json:"notes"`
	PrimaryActivity *string `json:"primaryActivity"`
	VideoLink       *string `json:"videoLink"`
	InputStyle      *string `json:"inputStyle"`
}

var sess *session.Session

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

	var requestModel UpdateBuildRequest
	err = json.Unmarshal([]byte(request.Body), &requestModel)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Unmarshal request body")
	}

	buildId := request.PathParameters["buildId"]

	// Fetch from Dynamo, confirm userId matches
	record, err := services.FetchBuildById(buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(updateBuild) FetchBuildsById")
	}
	if record.CreatedById != *membershipId {
		return utils.UnauthorizedResponse(nil)
	}

	if requestModel.Name != nil {
		// sess, err := session.NewSession()
		// if err != nil {
		// 	return utils.ErrorResponse(err, "(updateBuild) Creating AWS session to update Dynamo record")
		// }

		record.Summary.Name = *requestModel.Name
		// err = services.PutBuildToDynamo(sess, *record)
		fauna := services.NewFaunaProvider("FAUNA_SECRET", "https://db.us.fauna.com")
		err = fauna.PutBuild(*record)
		if err != nil {
			return utils.ErrorResponse(err, "(updateBuild) Put build to Dynamo")
		}
	}

	// Pull in entire build model
	bucketName := os.Getenv("BUCKET_NAME")
	build, err := services.FetchBuildFromS3(bucketName, buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(updateBuild) FetchBuildFromS3")
	}

	// Replace the name & notes if needed
	if requestModel.Name != nil {
		build.Name = *requestModel.Name
	}
	if requestModel.Notes != nil {
		build.Notes = *requestModel.Notes
	}
	if requestModel.InputStyle != nil {
		build.InputStyle = *requestModel.InputStyle
	}
	if requestModel.PrimaryActivity != nil {
		build.PrimaryActivity = *requestModel.PrimaryActivity
	}
	if requestModel.VideoLink != nil {
		build.VideoLink = *requestModel.VideoLink
	}

	// Save it back to S3
	err = services.PutBuildToS3(bucketName, buildId, *build)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Putting to S3")
	}

	// Send the update back to algolia
	algoliaRecord := build.ToAlgoliaRecord(buildId, *record)

	workspace := os.Getenv("ALGOLIA_WORKSPACE")
	key := os.Getenv("ALGOLIA_KEY")
	indexName := os.Getenv("ALGOLIA_INDEX")
	err = services.PostToAlgolia(workspace, key, indexName, algoliaRecord)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Putting to Algolia")
	}

	return utils.OkResponse(nil)
}
