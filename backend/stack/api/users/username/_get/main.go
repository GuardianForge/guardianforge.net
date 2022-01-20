package main

import (
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

type GetUserResponse struct {
	User   *dbModels.UserRecordData `json:"user,omitempty"`
	Builds *[]dbModels.BuildSummary `json:"builds,omitempty"`
	// Guardiand *dbModels.UserRecord `json:"user"`
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Lookup membershipId by bungie user name
	membershipId := request.PathParameters["membershipId"]
	if membershipId == "" {
		msg := "membershipId is required"
		return utils.BadRequestResponse(&msg)
	}

	res := GetUserResponse{}

	userRecordC := make(chan dbModels.UserRecordData)
	go func() {
		userRec, err := services.GetUserInfo(membershipId)
		if err != nil {
			log.Println("error occurred when getting user info", err)
		}
		userRecordC <- *userRec
	}()

	userBuildsC := make(chan []dbModels.BuildSummary)
	go func() {
		rec, err := services.FetchUserBuilds(membershipId)
		if err != nil {
			log.Println("error occurred when getting user builds", err)
		} else {
			userBuildsC <- *rec
		}
	}()

	userBuilds := <-userBuildsC
	res.Builds = &userBuilds

	userRec := <-userRecordC
	res.User = &userRec

	bytes, err := json.Marshal(res)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal to json bytes")
	}

	str := string(bytes)
	return utils.OkResponse(&str)
}
