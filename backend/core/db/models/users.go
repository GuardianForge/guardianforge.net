package models

import "errors"

type UserRecord struct {
	EntityType string         `dynamodbav:"entityType"`
	EntityId   string         `dynamodbav:"entityId"`
	Data       UserRecordData `dynamodbav:"data" json:"data"`
}

type UserRecordData struct {
	About               *string              `dynamodbav:"about" json:"about"`
	Social              *UserSocialInfo      `dynamodbav:"social" json:"social"`
	SubscriptionDetails *SubscriptionDetails `dynamodbav:"subscriptionDetails" json:"subscriptionDetails"`
}

type SubscriptionDetails struct {
	SubscriptionId *string  `dynamodbav:"subscriptionId" json:"subscriptionId"`
	StartDate      *float64 `dynamodbav:"startDate" json:"startDate"`
	EndDate        *float64 `dynamodbav:"endDate" json:"endDate"`
	AutoRenew      *bool    `dynamodbav:"autoRenew" json:"autoRenew"`
}

func MakeUserRecord(membershipId string) (*UserRecord, error) {
	if membershipId == "" {
		return nil, errors.New("cannot create UserRecord without membershipId")
	}

	r := UserRecord{
		EntityType: "user",
		EntityId:   membershipId,
	}
	return &r, nil
}

type UserSocialInfo struct {
	Facebook string `dynamodbav:"facebook" json:"facebook"`
	Twitter  string `dynamodbav:"twitter" json:"twitter"`
	YouTube  string `dynamodbav:"youtube" json:"youtube"`
	Twitch   string `dynamodbav:"twitch" json:"twitch"`
}
