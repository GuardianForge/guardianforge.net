package main

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

type GetMeResponse struct {
	User          *dbModels.UserRecordData          `json:"user,omitempty"`
	Builds        *[]dbModels.BuildSummary          `json:"builds,omitempty"`
	Bookmarks     *map[string]dbModels.BuildSummary `json:"bookmarks,omitempty"`
	Upvotes       *map[string]dbModels.BuildSummary `json:"upvotes,omitempty"`
	PrivateBuilds *map[string]dbModels.BuildSummary `json:"privateBuilds,omitempty"`
	// Guardiand *dbModels.UserRecord `json:"user"`
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	log.Println("(handler) membershipId", membershipId)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) validating request")
	}

	if membershipId == nil {
		return utils.UnauthorizedResponse(nil)
	}

	res := GetMeResponse{}

	userRecordC := make(chan dbModels.UserRecordData)
	go func() {
		userRec, err := services.GetUserInfo(*membershipId)
		if err != nil {
			log.Println("error occurred when getting user info", err)
		}

		if userRec != nil {
			userRecordC <- *userRec
		} else {
			close(userRecordC)
		}
	}()

	var userBuildsC chan []dbModels.BuildSummary
	var userBookmarksC chan map[string]dbModels.BuildSummary
	var userUpvotesC chan map[string]dbModels.BuildSummary
	var userPrivateBuildsC chan map[string]dbModels.BuildSummary

	rawParams, found := request.MultiValueQueryStringParameters["fetch"]
	fauna := services.NewFaunaProvider("FAUNA_SECRET", "https://db.us.fauna.com")
	if found {
		for _, el := range rawParams {
			split := strings.Split(el, ",")
			for _, sw := range split {
				if sw == "builds" {
					userBuildsC = make(chan []dbModels.BuildSummary)
					go func() {
						// rec, err := services.FetchUserBuilds(*membershipId)
						rec, err := fauna.FetchUserBuilds(*membershipId)
						if err != nil {
							log.Println("error occurred when getting user builds", err)
						}

						if rec != nil {
							userBuildsC <- *rec
						} else {
							close(userBuildsC)
						}
					}()
				}

				if sw == "bookmarks" {
					userBookmarksC = make(chan map[string]dbModels.BuildSummary)
					go func() {
						rec, err := services.FetchUserBookmarks(*membershipId)
						if err != nil {
							log.Println("error occurred when getting user bookmarks", err)
						}

						if rec != nil {
							userBookmarksC <- *rec
						} else {
							close(userBookmarksC)
						}
					}()
				}

				if sw == "upvotes" {
					userUpvotesC = make(chan map[string]dbModels.BuildSummary)
					go func() {
						rec, err := services.FetchUserUpvotes(*membershipId)
						if err != nil {
							log.Println("error occurred when getting user upvotes", err)
						}

						if rec != nil {
							userUpvotesC <- *rec
						} else {
							close(userUpvotesC)
						}
					}()
				}

				if sw == "privateBuilds" {
					userPrivateBuildsC = make(chan map[string]dbModels.BuildSummary)
					go func() {
						rec, err := services.FetchUserPrivateBuilds(*membershipId)
						if err != nil {
							log.Println("error occurred when getting user private builds", err)
						}

						if rec != nil {
							userPrivateBuildsC <- *rec
						} else {
							close(userPrivateBuildsC)
						}
					}()
				}
			}
		}
	}

	if userBuildsC != nil {
		userBuilds := <-userBuildsC
		res.Builds = &userBuilds
	}

	if userBookmarksC != nil {
		userBookmarks := <-userBookmarksC
		res.Bookmarks = &userBookmarks
	}

	if userUpvotesC != nil {
		userUpvotes := <-userUpvotesC
		res.Upvotes = &userUpvotes
	}

	if userPrivateBuildsC != nil {
		userPrivateBuilds := <-userPrivateBuildsC
		res.PrivateBuilds = &userPrivateBuilds
	}

	userRec := <-userRecordC
	res.User = &userRec

	bytes, err := json.Marshal(res)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal to json bytes")
	}

	str := string(bytes)
	return utils.OkResponse(&str)
}
