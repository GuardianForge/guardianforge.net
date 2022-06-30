package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	dbModels "guardianforge.net/core/db/models"
	"guardianforge.net/core/models"
	"guardianforge.net/core/services"
	"guardianforge.net/core/utils"
)

var sess *session.Session

type PostBuildResponse struct {
	BuildId string `json:"buildId"`
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	membershipId, err := utils.ValidateRequestAuth(request)
	if err != nil {
		log.Println("[WARN] Error occurred validating auth", err)
	}

	buildId := uuid.New().String()

	var build models.Build
	json.Unmarshal([]byte(request.Body), &build)

	// User is not logged in trying to create a private biuld
	if membershipId == nil && build.IsPrivate {
		msg := "Must be logged in to create private builds"
		return utils.UnauthorizedResponse(&msg)
	}

	// Add build to S3
	bucketName := os.Getenv("BUCKET_NAME")
	err = services.PutBuildToS3(bucketName, buildId, build)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) Put to S3")
	}

	dbBuild := build.ToDbRecord(buildId, time.Now().Unix(), membershipId)

	if build.IsPrivate {
		// Add to user private builds
		privateBuilds := map[string]dbModels.BuildSummary{}
		dbPrivateBuilds, err := services.FetchUserPrivateBuilds(*membershipId)
		if err != nil {
			return utils.ErrorResponse(err, "(handler) fetch private builds")
		}

		if dbPrivateBuilds != nil && len(*dbPrivateBuilds) > 0 {
			privateBuilds = *dbPrivateBuilds
		}
		log.Println("privateBuilds", privateBuilds)

		privateBuilds[buildId] = dbBuild.Summary

		err = services.PutUserPrivateBuilds(*membershipId, privateBuilds)
		if err != nil {
			return utils.ErrorResponse(err, "(handler) put user private builds")
		}
	} else {
		// Add to DB
		sess, err = session.NewSession()
		if err != nil {
			return utils.ErrorResponse(err, "(handler) create aws session")
		}

		splitSearchKey := strings.Split(dbBuild.SearchKey, "_")
		subclassCode := splitSearchKey[1]

		// err = services.PutBuildToDynamo(sess, dbBuild)
		// if err != nil {
		// 	return utils.ErrorResponse(err, "(handler) put build to dynamo")
		// }

		err := services.CreateBuild(dbBuild)
		if err != nil {
			return utils.ErrorResponse(err, "(handler) CreateBuild")
		}

		// TODO: Move this into the post-build handler
		sendToPostBuildHandler2(buildId, subclassCode, time.Now().Unix(), membershipId)
	}

	res := PostBuildResponse{
		BuildId: buildId,
	}
	jsonBytes, err := json.Marshal(res)
	if err != nil {
		return utils.ErrorResponse(err, "(handler) marshal response")
	}

	body := string(jsonBytes)
	return utils.CreatedResponse(&body)
}

func sendToPostBuildHandler2(buildId string, subclassCode string, publishedOn int64, membershipId *string) error {
	body := models.NewBuildHandlerSqsBody{
		BuildId:      buildId,
		SubclassCode: &subclassCode,
		PublishedOn:  publishedOn,
		MembershipId: membershipId,
	}

	queueUrl := os.Getenv("NEW_BUILDS_QUEUE")
	err := services.PostToSqs(queueUrl, body)
	if err != nil {
		return errors.Wrap(err, "(sendToPostBuildHandler) post to sqs")
	}
	return nil
}

func sendToPostBuildHandler(build models.Build, buildId string, subclassCode string) {
	// webhookUrl := os.Getenv("DISCORD_BUILD_WEBHOOK")
	embed := models.DiscordEmbed{
		Title:       &build.Name,
		Description: &build.Notes,
		Fields:      []models.EmbedField{},
	}

	dataBucketName := os.Getenv("BUCKET_NAME")
	ogImageUrl := fmt.Sprintf("https://%v.s3.amazonaws.com/og/%v.png", dataBucketName, buildId)
	image := models.EmbedImage{
		Url: ogImageUrl,
	}
	embed.Image = &image

	publicPath := os.Getenv("PUBLIC_PATH")
	buildUrl := fmt.Sprintf("%v/build/%v", publicPath, buildId)
	embed.Url = &buildUrl

	classField := models.EmbedField{
		Name:   "Class",
		Inline: true,
		Value:  "Unknown",
	}
	if build.Class == 0 {
		classField.Value = "Titan"
	} else if build.Class == 1 {
		classField.Value = "Hunter"
	} else if build.Class == 2 {
		classField.Value = "Warlock"
	}
	embed.Fields = append(embed.Fields, classField)

	if subclassCode != "" {
		subclassField := models.EmbedField{
			Name:   "Subclass",
			Inline: true,
			Value:  "Unknown",
		}

		if subclassCode == "2" {
			subclassField.Value = "Arc"
		} else if subclassCode == "3" {
			subclassField.Value = "Solar"
		} else if subclassCode == "4" {
			subclassField.Value = "Void"
		} else if subclassCode == "6" {
			subclassField.Value = "Stasis"
		}
		embed.Fields = append(embed.Fields, subclassField)
	}

	embeds := []models.DiscordEmbed{
		embed,
	}

	j, err := json.Marshal(embeds)
	if err != nil {
		log.Println("(sendToDiscord): Marshal", err)
	}

	queueUrl := os.Getenv("NEW_BUILDS_QUEUE")
	sqsInput := sqs.SendMessageInput{
		DelaySeconds: aws.Int64(30),
		MessageBody:  aws.String(string(j)),
		QueueUrl:     aws.String(queueUrl),
	}

	sqsClient := sqs.New(sess, aws.NewConfig())
	_, err = sqsClient.SendMessage(&sqsInput)
	if err != nil {
		log.Println("(sendToDiscord): send sqs message", err)
	}
}

// func putBuildToS3(buildId string, body *bytes.Buffer) error {
// 	acl := "public-read"
// 	bucketName := os.Getenv("BUCKET_NAME")
// 	log.Printf("Writing build %v to S3", buildId)
// 	key := fmt.Sprintf("builds/%v.json", buildId)
// 	// sess, err := session.NewSession()

// 	uploader := s3manager.NewUploader(sess)
// 	_, err := uploader.Upload(&s3manager.UploadInput{
// 		Bucket: &bucketName,
// 		Key:    &key,
// 		Body:   body,
// 		ACL:    &acl,
// 	})

// 	if err != nil {
// 		log.Panic("putBuildToS3", err)
// 		return err
// 	}
// 	return nil
// }
