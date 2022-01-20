package services

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pkg/errors"
	"guardianforge.net/core/db"
	dbModels "guardianforge.net/core/db/models"
)

func PutBuildToDynamo(awsSession *session.Session, buildRecord dbModels.Build) error {
	svc := dynamodb.New(awsSession)
	tableName := os.Getenv("TABLE_NAME")
	buildRecord.EntityType = "build"

	item, err := dynamodbattribute.MarshalMap(buildRecord)
	if err != nil {
		return errors.Wrap(err, "(PutBuildToDynamo) Marshal map")
	}

	input := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(tableName),
	}

	_, err = svc.PutItem(input)
	if err != nil {
		return err
	}

	return nil
}

func DeleteBuildFromDynamo(awsSession *session.Session, buildId string) error {
	svc := dynamodb.New(awsSession)
	tableName := os.Getenv("TABLE_NAME")

	input := &dynamodb.DeleteItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"entityType": {
				S: aws.String("build"),
			},
			"entityId": {
				S: aws.String(buildId),
			},
		},
		TableName: aws.String(tableName),
	}

	_, err := svc.DeleteItem(input)
	if err != nil {
		return errors.Wrap(err, "(DeleteBuildFromDynamo) Delete Item")
	}

	return nil
}

func FetchBuildById(buildId string) (*dbModels.Build, error) {
	tableName := os.Getenv("TABLE_NAME")
	context, err := db.MakeContext(nil, &tableName)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchBuildsById) make context")
	}

	params := &dynamodb.GetItemInput{
		TableName: context.TableName,
		Key: map[string]*dynamodb.AttributeValue{
			"entityType": {
				S: aws.String("build"),
			},
			"entityId": {
				S: aws.String(buildId),
			},
		},
	}

	result, err := context.DynamoSvc.GetItem(params)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchBuildsById) GetItem")
	}

	record := dbModels.Build{}
	err = dynamodbattribute.UnmarshalMap(result.Item, &record)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchBuildsById) Unmarshal Dynamo attribute")
	}

	return &record, nil
}

func FetchUserBuilds(membershipId string) (*[]dbModels.BuildSummary, error) {
	if membershipId == "" {
		return nil, errors.New("membershipId cannot be empty")
	}

	tableName := os.Getenv("TABLE_NAME")
	context, err := db.MakeContext(nil, &tableName)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserBuilds) make context")
	}

	// Build the query input parameters
	params := &dynamodb.QueryInput{
		KeyConditions: map[string]*dynamodb.Condition{
			"entityType": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String("build"),
					},
				},
			},
			"createdById": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String(membershipId),
					},
				},
			},
		},
		IndexName: aws.String("idx_createdById"),
		TableName: context.TableName,
	}

	// Make the DynamoDB Query API call
	result, err := context.DynamoSvc.Query(params)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserBuilds) Query")
	}

	summaries := []dbModels.BuildSummary{}

	for _, i := range result.Items {
		b := dbModels.Build{}

		err = dynamodbattribute.UnmarshalMap(i, &b)
		b.Summary.BuildId = &b.Id

		if err != nil {
			return nil, errors.Wrap(err, "(FetchUserBuilds) Unmarshalling dynmamo results")
		}
		summaries = append(summaries, b.Summary)
	}

	return &summaries, nil
}

func PutUserPrivateBuilds(membershipId string, privateBuilds map[string]dbModels.BuildSummary) error {
	if membershipId == "" {
		return errors.New("(PutUserPrivateBuilds) membershipId cannot be nil")
	}

	record := dbModels.PrivateBuildsRecord{
		EntityType: fmt.Sprintf("user_%v", membershipId),
		EntityId:   "private_builds",
		Data:       privateBuilds,
	}

	log.Println("record", record)

	item, err := dynamodbattribute.MarshalMap(record)
	if err != nil {
		return errors.Wrap(err, "(PutUserPrivateBuilds) marshal map")
	}

	_, err = putItem(item)
	if err != nil {
		return errors.Wrap(err, "(PutUserPrivateBuilds) put item")
	}

	return nil
}

func FetchUserBookmarks(membershipId string) (*map[string]dbModels.BuildSummary, error) {
	if membershipId == "" {
		return nil, errors.New("membershipId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserBookmarks) creating aws session")
	}
	svc := dynamodb.New(sess)
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
	result, err := svc.Query(params)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserBookmarks) querying")
	}

	for _, i := range result.Items {
		err := dynamodbattribute.UnmarshalMap(i, &record)
		if err != nil {
			return nil, errors.Wrap(err, "(FetchUserBookmarks) unmershalmap")
		}
	}

	return &record.Data, nil
}

func FetchUserPrivateBuilds(membershipId string) (*map[string]dbModels.BuildSummary, error) {
	if membershipId == "" {
		return nil, errors.New("membershipId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserPrivateBuilds) creating aws session")
	}
	svc := dynamodb.New(sess)
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
						S: aws.String("private_builds"),
					},
				},
			},
		},
		TableName: aws.String(tableName),
	}

	var record dbModels.BookmarksRecord
	result, err := svc.Query(params)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserPrivateBuilds) querying")
	}

	for _, i := range result.Items {
		err := dynamodbattribute.UnmarshalMap(i, &record)
		if err != nil {
			return nil, errors.Wrap(err, "(FetchUserPrivateBuilds) unmershalmap")
		}
	}

	return &record.Data, nil
}

func GetUserInfo(membershipId string) (*dbModels.UserRecordData, error) {
	if membershipId == "" {
		return nil, errors.New("membershipId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(GetUserInfo) creating aws session")
	}
	svc := dynamodb.New(sess)
	tableName := os.Getenv("TABLE_NAME")

	input := &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]*dynamodb.AttributeValue{
			"entityType": {
				S: aws.String("user"),
			},
			"entityId": {
				S: aws.String(membershipId),
			},
		},
	}

	result, err := svc.GetItem(input)
	if err != nil {
		return nil, errors.Wrap(err, "(GetUserInfo) GetItem")
	}

	record := dbModels.UserRecord{}
	err = dynamodbattribute.UnmarshalMap(result.Item, &record)
	if err != nil {
		return nil, errors.Wrap(err, "(GetUserInfo) Unmarshal Dynamo attribute")
	}

	return &record.Data, nil
}

func UpdateUserInfo(record dbModels.UserRecord) error {
	item, err := dynamodbattribute.MarshalMap(record)
	if err != nil {
		return errors.Wrap(err, "(UpdateUserInfo) marshal map")
	}

	_, err = putItem(item)
	if err != nil {
		return errors.Wrap(err, "(UpdateUserInfo) put item")
	}

	return nil
}

func putItem(item map[string]*dynamodb.AttributeValue) (*dynamodb.PutItemOutput, error) {
	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(putItem) creating session")
	}

	svc := dynamodb.New(sess)
	tableName := os.Getenv("TABLE_NAME")

	input := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(tableName),
	}

	output, err := svc.PutItem(input)
	if err != nil {
		return nil, errors.Wrap(err, "(putItem) put item")
	}

	return output, nil
}

func FetchUserUpvotes(membershipId string) (*map[string]dbModels.BuildSummary, error) {
	if membershipId == "" {
		return nil, errors.New("membershipId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserUpvotes) creating aws session")
	}
	svc := dynamodb.New(sess)
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
						S: aws.String("upvotes"),
					},
				},
			},
		},
		TableName: aws.String(tableName),
	}

	var record dbModels.UpvotesRecord
	result, err := svc.Query(params)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchUserUpvotes) querying")
	}

	for _, i := range result.Items {
		err := dynamodbattribute.UnmarshalMap(i, &record)
		if err != nil {
			return nil, errors.Wrap(err, "(FetchUserUpvotes) unmarshalmap")
		}
	}

	if record.Data == nil {
		return nil, nil
	}

	return &record.Data, nil
}

func FetchLatestBuilds() ([]dbModels.BuildSummary, error) {
	tableName := os.Getenv("TABLE_NAME")
	context, err := db.MakeContext(nil, &tableName)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchLatestBuilds) make context")
	}

	var limit int64 = 15
	scanIndexForward := false

	// Build the query input parameters
	params := &dynamodb.QueryInput{
		KeyConditions: map[string]*dynamodb.Condition{
			"entityType": {
				ComparisonOperator: aws.String("EQ"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						S: aws.String("build"),
					},
				},
			},
			"publishedOn": {
				ComparisonOperator: aws.String("LT"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						N: aws.String(fmt.Sprint(time.Now().Unix())),
					},
				},
			},
		},
		IndexName:        aws.String("idx_publishedOn"),
		Limit:            &limit,
		TableName:        context.TableName,
		ScanIndexForward: &scanIndexForward,
	}

	// Make the DynamoDB Query API call
	result, err := context.DynamoSvc.Query(params)
	if err != nil {
		return nil, err
	}

	summaries := []dbModels.BuildSummary{}

	for _, i := range result.Items {
		b := dbModels.Build{}

		err = dynamodbattribute.UnmarshalMap(i, &b)
		if err != nil {
			return nil, errors.Wrap(err, "(getLatestBuilds) Unmarshalling dynmamo results")
		}
		s, err := b.GetBuildSummary()
		if err != nil {
			return nil, errors.Wrap(err, "(getLatestBuilds) Get build summary")
		}
		summaries = append(summaries, *s)
	}

	return summaries, nil
}

func UpdateBuildUpvoteCount(buildId string, isDecrementing bool) error {
	if buildId == "" {
		return errors.New("buildId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return errors.Wrap(err, "(UpdateBuildUpvoteCount) creating aws session")
	}
	svc := dynamodb.New(sess)
	tableName := os.Getenv("TABLE_NAME")

	v := "1"
	if isDecrementing {
		v = "-1"
	}

	input := &dynamodb.UpdateItemInput{
		Key: map[string]*dynamodb.AttributeValue{
			"entityType": {
				S: aws.String("build"),
			},
			"entityId": {
				S: aws.String(buildId),
			},
		},
		UpdateExpression: aws.String("ADD upvotes :v"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":v": {
				N: aws.String(v),
			},
		},
		TableName: aws.String(tableName),
	}

	_, err = svc.UpdateItem(input)
	if err != nil {
		return errors.Wrap(err, "(UpdateBuildUpvoteCount) put item")
	}

	return nil
}

func PutUserUpvotesToDynamo(membershipId string, upvotes map[string]dbModels.BuildSummary) error {
	if membershipId == "" {
		return errors.New("(PutUserUpvotesToDynamo) membershipId cannot be empty")
	}

	sess, err := session.NewSession()
	if err != nil {
		return errors.Wrap(err, "(PutUserUpvotesToDynamo) creating aws session")
	}
	svc := dynamodb.New(sess)
	tableName := os.Getenv("TABLE_NAME")

	record := dbModels.UpvotesRecord{
		EntityType: fmt.Sprintf("user_%v", membershipId),
		EntityId:   "upvotes",
		Data:       upvotes,
	}

	item, err := dynamodbattribute.MarshalMap(record)
	if err != nil {
		return errors.Wrap(err, "(PutUserUpvotesToDynamo) marshal map")
	}

	input := &dynamodb.PutItemInput{
		Item:      item,
		TableName: aws.String(tableName),
	}

	_, err = svc.PutItem(input)
	if err != nil {
		return errors.Wrap(err, "(PutUserUpvotesToDynamo) put item")
	}

	return nil
}
