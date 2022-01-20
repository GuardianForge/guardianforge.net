package main

import (
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pkg/errors"
	"guardianforge.net/core/db"
	"guardianforge.net/core/db/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	buildId := request.PathParameters["buildId"]

	// Build the query input parameters
	build, err := services.FetchBuildById(buildId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Fetch build by id")
	}

	count := 0
	if build.Id != "" {
		count = build.Upvotes
	} else {
		count = -1
	}

	body := fmt.Sprint(count)

	fmt.Println("Upvotes: ", body)
	return utils.OkResponse(&body)

	// ================
	// count, err := getUpvoteCount(request.PathParameters["buildId"])
	// if err != nil {
	// 	log.Println(err)
	// 	return events.APIGatewayProxyResponse{
	// 		Body:       err.Error(),
	// 		StatusCode: 500,
	// 	}, err
	// }

	// return events.APIGatewayProxyResponse{
	// 	Body: fmt.Sprintf("%v", count),
	// 	Headers: map[string]string{
	// 		"Content-Type":                 "application/json",
	// 		"Access-Control-Allow-Origin":  "*",
	// 		"Access-Control-Allow-Methods": "*",
	// 		"Access-Control-Allow-Headers": "*",
	// 	},
	// 	StatusCode: 200,
	// }, nil
}

func getUpvoteCount(buildId string) (int, error) {
	tableName := os.Getenv("TABLE_NAME")
	context, err := db.MakeContext(nil, &tableName)
	if err != nil {
		return 0, errors.Wrap(err, "(getUpvoteCount) make context")
	}

	// Build the query input parameters
	params := &dynamodb.GetItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"entityType": {
				S: aws.String("build"),
			},
			"entityId": {
				S: aws.String(buildId),
			},
		},
		TableName: context.TableName,
	}

	// Make the DynamoDB Query API call
	result, err := context.DynamoSvc.GetItem(params)
	if err != nil {
		return 0, errors.Wrap(err, "(getUpvoteCount) get item")
	}

	b := models.Build{}
	err = dynamodbattribute.UnmarshalMap(result.Item, &b)
	if err != nil {
		return 0, errors.Wrap(err, "(getUpvoteCount) unmarshal map")
	}
	return b.Upvotes, nil
}
