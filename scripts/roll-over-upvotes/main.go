package main

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/pkg/errors"
)

const (
	CurrentSeason string = "15"
	SeasonStart   string = "1629824400" // Aug 24 2021 at 12pm central, start of S15
)

func main() {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_DEFAULT_REGION"))},
	)
	if err != nil {
		log.Fatal("session.NewSession()", err)
	}

	// Get all builds from dynamo
	builds, err := FetchBuildRecords()
	if err != nil {
		log.Fatal("FetchBuildRecords()", err)
	}
	for _, el := range builds {
		if el.SeasonalUpvotes == nil {
			el.SeasonalUpvotes = map[string]int{
				CurrentSeason: el.Upvotes,
			}
		} else {
			el.SeasonalUpvotes[CurrentSeason] = el.Upvotes
		}
		el.Upvotes = 0
		err := PutBuildToDynamo(sess, el)
		if err != nil {
			log.Fatal("PutBuildToDynamo()", err)
		}
	}
}

func FetchBuildRecords() ([]Build, error) {
	tableName := os.Getenv("TABLE_NAME")
	context, err := MakeContext(nil, &tableName)
	if err != nil {
		return nil, errors.Wrap(err, "(FetchBuildRecords) make context")
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
			"publishedOn": {
				ComparisonOperator: aws.String("GT"),
				AttributeValueList: []*dynamodb.AttributeValue{
					{
						N: aws.String(SeasonStart),
					},
				},
			},
		},
		IndexName: aws.String("idx_publishedOn"),
		TableName: context.TableName,
	}

	// Make the DynamoDB Query API call
	result, err := context.DynamoSvc.Query(params)
	if err != nil {
		return nil, err
	}

	builds := []Build{}

	for _, i := range result.Items {
		b := Build{}

		err = dynamodbattribute.UnmarshalMap(i, &b)
		if err != nil {
			return nil, errors.Wrap(err, "(FetchBuildRecords) Unmarshalling dynmamo results")
		}
		builds = append(builds, b)
	}

	return builds, nil
}

type Build struct {
	EntityType      string         `json:"entityType" dynamodbav:"entityType"`
	Id              string         `json:"entityId" dynamodbav:"entityId"`
	PublishedOn     int64          `json:"publishedOn" dynamodbav:"publishedOn"`
	CreatedById     string         `json:"createdById" dynamodbav:"createdById"`
	IsPrivate       bool           `json:"isPrivate" dynamodbav:"isPrivate"`
	SearchKey       string         `json:"searchKey" dynamodbav:"searchKey"`
	Summary         BuildSummary   `json:"summary" dynamodbav:"summary"`
	Upvotes         int            `json:"upvotes" dynamodbav:"upvotes"`
	SeasonalUpvotes map[string]int `json:"seasonalUpvotes" dynamodbav:"seasonalUpvotes"`
}

func (b *Build) GetBuildSummary() (*BuildSummary, error) {
	b.Summary.BuildId = &b.Id
	b.Summary.Upvotes = &b.Upvotes

	splitKey := strings.Split(b.SearchKey, "_")
	if len(splitKey) == 3 && splitKey[2] != "" {
		activityId, err := strconv.Atoi(splitKey[2])
		if err != nil {
			return nil, errors.Wrap(err, "(GetBuildSummary) Parsing activity id")
		}
		b.Summary.Activity = &activityId
	}
	return &b.Summary, nil
}

type BuildSummary struct {
	UserId         string   `json:"userId" dynamodbav:"userId"`
	Username       string   `json:"username" dynamodbav:"username"`
	Highlights     []string `json:"highlights" dynamodbav:"highlights"`
	Name           string   `json:"name" dynamodbav:"name"`
	PrimaryIconSet string   `json:"primaryIconSet" dynamodbav:"primaryIconSet"`

	// Non DynamoDB Fields
	BuildId  *string `json:"id"`
	Activity *int    `json:"activity"`
	Upvotes  *int    `json:"upvotes"`
}

type DbContext struct {
	DynamoSvc *dynamodb.DynamoDB
	Session   *session.Session
	TableName *string
}

func MakeContext(sess *session.Session, tableName *string) (*DbContext, error) {
	var _session *session.Session
	if sess == nil {
		sess, err := session.NewSession(&aws.Config{
			Region: aws.String("us-west-1")},
		)
		if err != nil {
			return nil, errors.Wrap(err, "(MakeContext) creating session")
		}
		_session = sess
	} else {
		_session = sess
	}

	svc := dynamodb.New(_session)

	context := DbContext{
		DynamoSvc: svc,
		Session:   _session,
	}

	if tableName != nil {
		context.TableName = tableName
	}
	return &context, nil
}

func PutBuildToDynamo(awsSession *session.Session, buildRecord Build) error {
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
