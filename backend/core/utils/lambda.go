package utils

import (
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/bmorrisondev/bunGOnet"
	"github.com/pkg/errors"
)

func ValidateRequestAuth(request events.APIGatewayProxyRequest) (*string, error) {
	authHeader, ok := request.Headers["Authorization"]
	if !ok {
		log.Println("(ValidateRequestAuth) Invalid auth header (1)")
		return nil, nil
	}

	split := strings.Split(authHeader, " ")
	if len(split) != 2 {
		log.Println("(ValidateRequestAuth) Invalid auth header (2)")
		return nil, nil
	}

	if strings.ToLower(split[0]) != "bearer" {
		log.Println("(ValidateRequestAuth) Invalid auth header (3)")
		return nil, nil
	}

	bunGOnet.SetApiKey(os.Getenv("BUNGIE_API_KEY"))
	authRes, err := bunGOnet.GetMembershipsForCurrentUser(split[1])
	if err != nil {
		log.Println("(ValidateRequestAuth) GetMembershipsForCurrentUser")
		return nil, err
	}

	if authRes.BungieNetUser.MembershipId == "" {
		log.Println("(ValidateRequestAuth) No MembershipId")
		return nil, nil
	}

	return &authRes.BungieNetUser.MembershipId, nil
}

func IsAdmin(membershipId *string) bool {
	if membershipId == nil {
		return false
	}
	return *membershipId == "14214042"
}

func HandleError(err error, message string) (events.APIGatewayProxyResponse, error) {
	err = errors.Wrap(err, message)
	log.Println(err)
	errStr := err.Error()
	return makeResponse(&errStr, 500)
}

func ErrorResponse(err error, message string) (events.APIGatewayProxyResponse, error) {
	err = errors.Wrap(err, message)
	log.Println(err)
	errStr := err.Error()
	return makeResponse(&errStr, 500)
}

func UnauthorizedResponse(body *string) (events.APIGatewayProxyResponse, error) {
	return makeResponse(body, 401)
}

func OkResponse(body *string) (events.APIGatewayProxyResponse, error) {
	return makeResponse(body, 200)
}

func CreatedResponse(body *string) (events.APIGatewayProxyResponse, error) {
	return makeResponse(body, 201)
}

func BadRequestResponse(body *string) (events.APIGatewayProxyResponse, error) {
	return makeResponse(body, 400)
}

func makeResponse(body *string, statusCode int) (events.APIGatewayProxyResponse, error) {
	res := events.APIGatewayProxyResponse{
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
		StatusCode: statusCode,
	}

	if body != nil {
		res.Body = *body
	}

	return res, nil
}
