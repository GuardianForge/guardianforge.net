package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pkg/errors"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	userId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.HandleError(err, "(handler) validating request")
	}

	if userId != nil {
		var summary dbModels.BuildSummary
		err = json.Unmarshal([]byte(request.Body), &summary)
		if err != nil {
			return utils.HandleError(err, "(handler) json.Unmarshal")
		}

		buildBytes, err := updateBookmarks(*userId, summary)
		if err != nil {
			return utils.HandleError(err, "(handler) json.Unmarshal")
		}

		return events.APIGatewayProxyResponse{
			Body: string(buildBytes),
			Headers: map[string]string{
				"Content-Type":                 "application/json",
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			StatusCode: 200,
		}, nil
	} else {
		return events.APIGatewayProxyResponse{
			Headers: map[string]string{
				"Content-Type":                 "application/json",
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "*",
				"Access-Control-Allow-Headers": "*",
			},
			StatusCode: 401,
		}, nil
	}
}

func updateBookmarks(userId string, buildSummary dbModels.BuildSummary) ([]byte, error) {
	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(updateBookmarks) creating session")
	}

	svc := dynamodb.New(sess)
	bookmarks, err := fetchFromDynamo(svc, userId)
	if err != nil {
		return nil, errors.Wrap(err, "(updateBookmarks) fetchFromDynamo")
	}

	if _, ok := bookmarks[*buildSummary.BuildId]; ok {
		delete(bookmarks, *buildSummary.BuildId)
	} else {
		bookmarks[*buildSummary.BuildId] = buildSummary
	}

	err = putToDynamo(svc, userId, bookmarks)
	if err != nil {
		return nil, errors.Wrap(err, "(updateBookmarks) put to dynamo")
	}

	// Save it
	jsonBuilds, err := json.Marshal(bookmarks)
	if err != nil {
		return nil, errors.Wrap(err, "(updateBookmarks) marshal json")
	}

	return jsonBuilds, nil
}

func fetchFromDynamo(dynamoSvc *dynamodb.DynamoDB, membershipId string) (map[string]dbModels.BuildSummary, error) {
	tableName := os.Getenv("TABLE_NAME")
	params := &dynamodb.QueryInput{
		KeyConditions: map[string]*dynamodb.Condition{
			"entityType": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String(fmt.Sprintf("user_%v", membershipId)),
					},
				},
			},
			"entityId": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String("bookmarks"),
					},
				},
			},
		},
		TableName: aws.String(tableName),
	}

	var record dbModels.BookmarksRecord
	result, err := dynamoSvc.Query(params)
	if err != nil {
		return nil, errors.Wrap(err, "(fetchFromDynamo) querying")
	}

	for _, i := range result.Items {
		err := dynamodbattribute.UnmarshalMap(i, &record)
		if err != nil {
			return nil, errors.Wrap(err, "(fetchFromDynamo) unmershalmap")
		}
	}

	if record.Data == nil {
		return map[string]dbModels.BuildSummary{}, nil
	}

	return record.Data, nil
}

func putToDynamo(svc *dynamodb.DynamoDB, membershipId string, bookmarks map[string]dbModels.BuildSummary) error {
	tableName := os.Getenv("TABLE_NAME")
	record := dbModels.BookmarksRecord{
		EntityType: fmt.Sprintf("user_%v", membershipId),
		EntityId:   "bookmarks",
		Data:       bookmarks,
	}

	item, err := dynamodbattribute.MarshalMap(record)
	if err != nil {
		return errors.Wrap(err, "(putToDynamo) marshal map")
	}

	input := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(tableName),
	}

	_, err = svc.PutItem(input)
	if err != nil {
		return errors.Wrap(err, "(putToDynamo) put item")
	}

	return nil
}
