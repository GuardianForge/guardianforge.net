package models

type BuildSummary struct {
	UserId         string   `json:"userId" dynamodbav:"userId" fauna:"userId"`
	Username       string   `json:"username" dynamodbav:"username" fauna:"username"`
	Highlights     []string `json:"highlights" dynamodbav:"highlights" fauna:"highlights"`
	Name           string   `json:"name" dynamodbav:"name" fauna:"name"`
	PrimaryIconSet string   `json:"primaryIconSet" dynamodbav:"primaryIconSet" fauna:"primaryIconSet"`

	// Non DynamoDB Fields
	BuildId  *string `json:"id"`
	Activity *int    `json:"activity"`
	Upvotes  *int    `json:"upvotes"`
}
