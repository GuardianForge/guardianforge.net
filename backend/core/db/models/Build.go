package models

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/pkg/errors"
)

type Build struct {
	EntityType  string       `json:"entityType" dynamodbav:"entityType"`
	Id          string       `json:"entityId" dynamodbav:"entityId"`
	PublishedOn int64        `json:"publishedOn" dynamodbav:"publishedOn"`
	CreatedById string       `json:"createdById" dynamodbav:"createdById"`
	IsPrivate   bool         `json:"isPrivate" dynamodbav:"isPrivate"`
	SearchKey   string       `json:"searchKey" dynamodbav:"searchKey"`
	Summary     BuildSummary `json:"summary" dynamodbav:"summary"`
	Upvotes     int          `json:"upvotes" dynamodbav:"upvotes"`
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

type PrivateBuildsRecord struct {
	EntityType string                  `dynamodbav:"entityType"`
	EntityId   string                  `dynamodbav:"entityId"`
	Data       map[string]BuildSummary `dynamodbav:"data"`
}

func MakePrivateBuildsRecord(membershipId string) (*PrivateBuildsRecord, error) {
	if membershipId == "" {
		return nil, errors.New("cannot create UserRecord without membershipId")
	}

	r := PrivateBuildsRecord{
		EntityType: fmt.Sprintf("user_%v", membershipId),
		EntityId:   "private_builds",
	}
	return &r, nil
}
