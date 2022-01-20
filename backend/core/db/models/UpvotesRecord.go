package models

type UpvotesRecord struct {
	EntityType string                  `dynamodbav:"entityType"`
	EntityId   string                  `dynamodbav:"entityId"`
	Data       map[string]BuildSummary `dynamodbav:"data"`
}
