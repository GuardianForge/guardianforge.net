package models

type DynamoRecordBase struct {
	EntityType string `dynamodbav:"entityType"`
	EntityId   string `dynamodbav:"entityId"`
}
