package models

type BookmarksRecord struct {
	EntityType string                  `dynamodbav:"entityType"`
	EntityId   string                  `dynamodbav:"entityId"`
	Data       map[string]BuildSummary `dynamodbav:"data"`
}
