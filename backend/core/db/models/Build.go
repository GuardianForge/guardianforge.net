package models

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/pkg/errors"
)

type Build struct {
	EntityType  string       `json:"entityType" dynamodbav:"entityType" fauna:"entityType,omitempty"`
	Id          string       `json:"entityId" dynamodbav:"entityId" fauna:"entityId,omitempty"`
	PublishedOn int64        `json:"publishedOn" dynamodbav:"publishedOn" fauna:"publishedOn,omitempty"`
	CreatedById string       `json:"createdById" dynamodbav:"createdById" fauna:"createdById,omitempty"`
	IsPrivate   bool         `json:"isPrivate" dynamodbav:"isPrivate" fauna:"isPrivate,omitempty"`
	SearchKey   string       `json:"searchKey" dynamodbav:"searchKey" fauna:"searchKey,omitempty"`
	Summary     BuildSummary `json:"summary" dynamodbav:"summary" fauna:"summary,omitempty"`
	Upvotes     int          `json:"upvotes" dynamodbav:"upvotes" fauna:"upvotes,omitempty"`
}

func (b *Build) GetBuildSummary() (*BuildSummary, error) {
	idString := b.Id
	b.Summary.BuildId = &idString
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
