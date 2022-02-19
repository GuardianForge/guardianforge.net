package main

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fauna := services.NewFaunaProvider("FAUNA_SECRET", "https://db.us.fauna.com")
	// records, err := services.FetchBuildRecords()
	// if err != nil {
	// 	log.Println("fetch build records", err)
	// }
	// for _, r := range records {
	// 	err := fauna.PutBuild(nil, r)
	// 	if err != nil {
	// 		log.Println("couldnt put build", err)
	// 	}
	// }

	builds, err := fauna.FetchLatestBuilds()
	if err != nil {
		return utils.ErrorResponse(err, "(handler) fetch latest builds")
	}

	// builds, err := services.FetchLatestBuilds()
	// if err != nil {
	// 	return utils.ErrorResponse(err, "(handler) fetch latest builds")
	// }

	jbytes, err := json.Marshal(builds)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal json")
	}

	strBody := string(jbytes)

	return utils.OkResponse(&strBody)
}
