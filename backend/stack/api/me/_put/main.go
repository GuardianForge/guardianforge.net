package main

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/finnbear/moderation"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

type UpdateMyInfoRequest struct {
	About      *string         `json:"about"`
	SocialInfo *UserSocialInfo `json:"social"`
}

type UserSocialInfo struct {
	Facebook *string `json:"facebook"`
	Twitter  *string `json:"twitter"`
	YouTube  *string `json:"youtube"`
	Twitch   *string `json:"twitch"`
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) validating request")
	}

	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	var body UpdateMyInfoRequest
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal json")
	}

	if body.About != nil && moderation.IsInappropriate(*body.About) {
		log.Println("About is not appropriate")
		err := errors.New("CONTENT_INAPPROPRIATE")
		return utils.ErrorResponse(err, "")
	}

	record, err := dbModels.MakeUserRecord(*membershipId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) dbModels.MakeUserRecord")
	}

	MapUpdates(record, body)

	err = services.UpdateUserInfo(*record)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) services.UpdateUserInfo")
	}

	return utils.OkResponse(nil)
}

func MapUpdates(userRecord *dbModels.UserRecord, updates UpdateMyInfoRequest) {
	if updates.About != nil {
		userRecord.Data.About = updates.About
	}

	if updates.SocialInfo != nil {
		if userRecord.Data.Social == nil {
			userRecord.Data.Social = &dbModels.UserSocialInfo{}
		}

		if updates.SocialInfo.Facebook != nil {
			userRecord.Data.Social.Facebook = *updates.SocialInfo.Facebook
		}

		if updates.SocialInfo.Twitter != nil {
			userRecord.Data.Social.Twitter = *updates.SocialInfo.Twitter
		}

		if updates.SocialInfo.YouTube != nil {
			userRecord.Data.Social.YouTube = *updates.SocialInfo.YouTube
		}

		if updates.SocialInfo.Twitch != nil {
			userRecord.Data.Social.Twitch = *updates.SocialInfo.Twitch
		}
	}
}
