package models

type BuildSummary struct {
	UserId         string   `json:"userId" dynamodbav:"userId"`
	Username       string   `json:"username" dynamodbav:"username"`
	Highlights     []string `json:"highlights" dynamodbav:"highlights"`
	Name           string   `json:"name" dynamodbav:"name"`
	PrimaryIconSet string   `json:"primaryIconSet" dynamodbav:"primaryIconSet"`

	// Non DynamoDB Fields
	BuildId         *string         `json:"id"`
	Activity        *int            `json:"activity"`
	Upvotes         *int            `json:"upvotes"`
	SeasonalUpvotes *map[string]int `json:"seasonalUpvotes"`
}
