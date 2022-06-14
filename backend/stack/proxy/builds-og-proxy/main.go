package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	publicPath := os.Getenv("PUBLIC_PATH")
	dataBucketName := os.Getenv("DATA_BUCKET_NAME")
	srcOgImageTag := fmt.Sprintf("<meta property=\"og:image\" content=\"%v/img/social.png\"/>", publicPath)
	dstOgImageTag := fmt.Sprintf("<meta property=\"og:image\" content=\"https://%v.s3.amazonaws.com/og/%v.png\">", dataBucketName, request.PathParameters["buildId"])

	res, err := http.Get(publicPath)

	if err != nil {
		log.Println(err)
		return events.APIGatewayProxyResponse{
			Body:       err.Error(),
			StatusCode: 500,
		}, nil
	}
	defer res.Body.Close()

	htmlByte, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Println(err)
		return events.APIGatewayProxyResponse{
			Body:       err.Error(),
			StatusCode: 500,
		}, nil
	}

	html := string(htmlByte)
	html = strings.Replace(html, srcOgImageTag, dstOgImageTag, 1)
	html = strings.Replace(html, "<meta property=\"twitter:card\" content=\"summary_large_image\"/>", "<meta name=\"twitter:card\" content=\"summary\">", 1)

	return events.APIGatewayProxyResponse{
		Body: html,
		Headers: map[string]string{
			"Content-Type":                 "text/html",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "*",
			"Access-Control-Allow-Headers": "*",
		},
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
